const factory = require("./factory/handlerFactory");
const Order = require("../models/orderModel");
const catchAsync = require("../../utils/catchAsync");
const AppError = require("../../utils/appError");

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
