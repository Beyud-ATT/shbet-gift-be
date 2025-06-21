const factory = require("./factory/handlerFactory");
const Order = require("../models/orderModel");
const catchAsync = require("../../utils/catchAsync");
const Settings = require("../models/settingModel");
const Customer = require("../models/customerModel");
const Product = require("../models/productModel");
const { getSummaryAccount } = require("../../services/gpkService");
const AppError = require("../../utils/appError");
const { isPromotionActive } = require("../../utils/helper");

exports.getOrders = factory.getAll(Order);
exports.createOrder = factory.createOne(Order);
exports.getOrder = factory.getOne(Order);
exports.updateOrder = factory.updateOne(Order);
exports.deleteOrder = factory.deleteOne(Order);

exports.customerCreateOrder = catchAsync(async (req, res, next) => {
  const { customer } = req;
  const { product, address, note } = req.body;

  if (!isPromotionActive()) {
    return next(new AppError("Khuyến mãi chưa bắt đầu !!!", 400));
  }

  const settings = await Settings.findOne({});
  const { vipLevel: requiredVipLevel } = settings;
  if (!settings.status) {
    return next(new AppError("Khuyến mãi chưa bắt đầu !!!", 400));
  }

  const customerRecord = await Customer.findById(customer.id);
  if (!customerRecord) {
    return next(new AppError("Không tìm thấy thông tin khách hàng !!!", 404));
  }
  if (
    new Date(customerRecord.lastParticipateDate).getDate() ===
    new Date().getDate()
  ) {
    return next(new AppError("Tài khoản của bạn đã tham gia !!!", 400));
  }

  const productRecord = await Product.findById(product);
  const { requiredDeposit, requiredBet } = productRecord;
  if (!productRecord) {
    return next(new AppError("Không tìm thấy thông tin sản phẩm !!!", 404));
  }

  const accountSummary = await getSummaryAccount({
    account: customerRecord.account,
    startTime: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
    endTime: new Date(),
  });
  const { TotalValidBet, TotalDepositAmount } = accountSummary.Data;

  if (
    customer.vipLevel < requiredVipLevel ||
    TotalValidBet < requiredBet ||
    TotalDepositAmount < requiredDeposit
  ) {
    return next(
      new AppError("Tài khoản của bạn không đủ điều kiện để tham gia !!!", 400),
    );
  }

  const newOrder = await Order.create({
    customer: customer.id,
    product,
    address,
    note,
  });

  res.status(201).json({
    status: "success",
    data: newOrder,
  });
});
