const factory = require("./factory/handlerFactory");
const Order = require("../models/orderModel");
const catchAsync = require("../../utils/catchAsync");
const AppError = require("../../utils/appError");
const { sendConfirmMail } = require("../../utils/gpkAPI");
const Product = require("../models/productModel");

exports.getOrders = factory.getAll(Order);
exports.createOrder = factory.createOne(Order);
exports.getOrder = factory.getOne(Order);
exports.updateOrder = factory.updateOne(Order);
exports.deleteOrder = factory.deleteOne(Order);

exports.customerCreateOrder = catchAsync(async (req, res, next) => {
  const { customer, product } = req;
  const { address, note, name, phone } = req.body;

  if (!product || !address || !name || !phone) {
    return next(new AppError("Hãy nhập thông tin đầy đủ !!!", 400));
  }

  const newOrder = await Order.create({
    customer: customer.id,
    product: product._id,
    address,
    note,
    name,
    phone,
  });

  res.status(201).json({
    status: "success",
    data: newOrder,
  });
});

exports.acceptOrder = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  if (!id) {
    return next(new AppError("Hãy nhập thông tin đầy đủ !!!", 400));
  }

  const order = await Order.findById(id);
  if (!order) {
    return next(new AppError("Không tìm thấy thông tin đơn hàng !!!", 404));
  }
  if (order.status !== "pending" || order.status !== "mailed") {
    return next(new AppError("Đơn hàng đã được xử lý !!!", 400));
  }

  order.status = "accepted";
  await order.save();

  res.status(200).json({
    status: "success",
    data: order,
  });
});

exports.rejectOrder = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const { rejectedReason } = req.body;

  if (!id) {
    return next(new AppError("Hãy nhập thông tin đầy đủ !!!", 400));
  }
  if (!rejectedReason || rejectedReason.trim() === "") {
    return next(new AppError("Hãy nhập lý do !!!", 400));
  }

  const order = await Order.findById(id);
  if (!order) {
    return next(new AppError("Không tìm thấy thông tin đơn hàng !!!", 404));
  }
  if (order.status !== "pending" && order.status !== "mailed") {
    return next(new AppError("Đơn hàng đã được xử lý !!!", 400));
  }

  order.status = "rejected";
  order.rejectedReason = rejectedReason;
  await order.save();

  res.status(200).json({
    status: "success",
    data: order,
  });
});

exports.sendConfirmMail = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const { account, subject, content } = req.body;

  if (!id) {
    return next(new AppError("Hãy nhập thông tin đầy đủ !!!", 400));
  }
  if (!account || account.trim() === "") {
    return next(new AppError("Hãy nhập tài khoản !!!", 400));
  }
  if (!subject || subject.trim() === "") {
    return next(new AppError("Hãy nhập chủ đề !!!", 400));
  }
  if (!content || content.trim() === "") {
    return next(new AppError("Hãy nhập nội dung !!!", 400));
  }

  const order = await Order.findById(id);
  if (!order) {
    return next(new AppError("Không tìm thấy thông tin đơn hàng !!!", 404));
  }
  if (order.status !== "pending") {
    return next(new AppError("Đơn hàng đã được xử lý !!!", 400));
  }

  order.status = "mailed";
  await order.save();

  await sendConfirmMail({ account, subject, content });

  res.status(200).json({
    status: "success",
    data: order,
  });
});
