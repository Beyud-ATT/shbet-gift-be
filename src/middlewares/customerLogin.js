const AppError = require("../../utils/appError");
const catchAsync = require("../../utils/catchAsync");
const Customer = require("../models/customerModel");

exports.customerLogin = catchAsync(async (req, res, next) => {
  const { account, bankInfo } = req.body;

  if (!account) {
    return next(new AppError("Hãy nhập thông tin tài khoản !!!", 400));
  }

  const customer = await Customer.checkCustomerInfo({ account, bankInfo });

  if (!customer) {
    return next(new AppError("Không tìm thấy thông tin khách hàng !!!", 401));
  }

  req.customer = {
    id: customer._id,
    account,
    vipLevel: customer.vipLevel,
  };

  next();
});
