const { promisify } = require("util");
const jwt = require("jsonwebtoken");
const catchAsync = require("../../utils/catchAsync");
const User = require("../models/userModel");
const AppError = require("../../utils/appError");
const Customer = require("../models/customerModel");
const { signToken } = require("../../utils/helper");

const createSendToken = (user, statusCode, res) => {
  const token = signToken({ id: user._id, vipLevel: user.vipLevel });
  const cookieOptions = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000,
    ),
    httpOnly: false,
    secure: true,
  };

  if (process.env.NODE_ENV === "production") cookieOptions.secure = true;

  res.cookie("jwt", token, cookieOptions);

  user.password = undefined;

  res.status(statusCode).json({
    status: "success",
    token,
    data: user,
  });
};

exports.signup = catchAsync(async (req, res, next) => {
  const { name, username, password, passwordConfirm } = req.body;
  const newUser = await User.create({
    name,
    username,
    password,
    passwordConfirm,
  });

  createSendToken(newUser, 201, res);
});

exports.login = catchAsync(async (req, res, next) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return next(
      new AppError("Hãy nhập thông tin tài khoản và mật khẩu !!!", 400),
    );
  }

  const user = await User.findOne({ username }).select("+password");

  if (!user || !(await user.correctPassword(password, user.password))) {
    return next(new AppError("Các thông tin tài khoản không đúng !!!", 401));
  }

  createSendToken(user, 200, res);
});

exports.logout = catchAsync(async (req, res, next) => {
  res.cookie("jwt", "loggedout", {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true,
  });
  res
    .status(200)
    .json({ status: "success", message: "Logged out successfully" });
});

exports.protect = catchAsync(async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  } else {
    token = req.cookies.jwt;
  }

  if (!token) {
    return next(new AppError("No token provided", 401));
  }

  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

  const currentUser = await User.findById(decoded.id);
  if (!currentUser) {
    return next(new AppError("Không tìm thấy thông tin người dùng !!!", 404));
  }

  req.user = decoded;

  next();
});

exports.customerProtect = catchAsync(async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  } else {
    token = req.cookies.jwt;
  }

  if (!token) {
    return next(new AppError("No token provided", 401));
  }

  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

  const currentCustomer = await Customer.findById(decoded.id);
  if (!currentCustomer) {
    return next(new AppError("Không tìm thấy thông tin khách hàng !!!", 404));
  }

  req.customer = {
    id: decoded.id,
    account: currentCustomer.account,
    vipLevel: decoded.vipLevel,
  };

  next();
});

exports.customerLogin = catchAsync(async (req, res, next) => {
  const { account, bankInfo } = req.body;

  if (!account) {
    return next(new AppError("Hãy nhập thông tin tài khoản !!!", 400));
  }

  const customer = await Customer.checkCustomerInfo({ account, bankInfo });

  if (!customer) {
    return next(new AppError("Không tìm thấy thông tin khách hàng !!!", 404));
  }

  createSendToken(customer, 200, res);
});
