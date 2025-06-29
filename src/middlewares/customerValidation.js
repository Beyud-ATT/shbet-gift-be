const Settings = require("../models/settingModel");
const Customer = require("../models/customerModel");
const Product = require("../models/productModel");
const { getSummaryAccount } = require("../../services/gpkService");
const AppError = require("../../utils/appError");
const { isPromotionActive } = require("../../utils/helper");

module.exports = async function checkProductValid(req, res, next) {
  const { customer } = req;
  const { slug } = req.params;

  if (!slug) {
    return next(new AppError("Tìm kiếm sản phẩm thất bại !!!", 404));
  }

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

  const productRecord = await Product.findOne({ slug });
  if (!productRecord) {
    return next(new AppError("Không tìm thấy thông tin sản phẩm !!!", 404));
  }
  const { requiredDeposit, requiredBet, quantity, status } = productRecord;

  if (!status) {
    return next(new AppError("Sản phẩm không hợp lệ !!!", 400));
  }
  if (quantity <= 0) {
    return next(new AppError("Số lượng sản phẩm không đủ !!!", 400));
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
    console.log(`Customer vip level: ${customer.vipLevel}`);
    console.log(`Required vip level: ${requiredVipLevel}`);
    console.log(`Customer total valid bet: ${TotalValidBet}`);
    console.log(`Required total valid bet: ${requiredBet}`);
    console.log(`Customer total deposit amount: ${TotalDepositAmount}`);
    console.log(`Required total deposit amount: ${requiredDeposit}`);
    return next(
      new AppError("Tài khoản của bạn không đủ điều kiện để tham gia !!!", 400),
    );
  }

  productRecord.quantity -= 1;
  await productRecord.save();

  req.product = productRecord;

  next();
};
