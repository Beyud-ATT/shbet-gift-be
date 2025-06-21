const mongoose = require("mongoose");
const { getCustomerInfo } = require("../../services/gpkService");
const AppError = require("../../utils/appError");

const customerSchema = new mongoose.Schema(
  {
    account: {
      type: String,
      required: true,
      unique: true,
    },
    lastParticipateDate: { type: Date, default: Date.now },
    orders: [{ type: mongoose.Schema.Types.ObjectId, ref: "Order" }],
  },
  { timestamps: true },
);

customerSchema.statics.checkCustomerInfo = async function ({
  account,
  bankInfo,
}) {
  const customer = await this.findOne({ account });

  const dataFromPlatform = await getCustomerInfo({ account });
  const { Status, VipLevel, BankAccounts } = dataFromPlatform.Data;

  if (Status !== "Kích hoạt") {
    throw new AppError("Trạng thái tài khoản của bạn không hợp lệ !!!", 400);
  }

  const bankAccountList = BankAccounts.map((bank) => bank.Account.slice(-4));
  if (!bankAccountList.includes(bankInfo)) {
    throw new AppError("Thông tin tài khoản của bạn không hợp lệ !!!", 400);
  }

  if (!customer) {
    const data = {
      account,
      lastParticipateDate: Date.now(),
      orders: [],
    };

    const newCustomer = await this.create(data);

    return { ...newCustomer._doc, vipLevel: VipLevel };
  }

  return { ...customer._doc, vipLevel: VipLevel };
};

const Customer = mongoose.model("Customer", customerSchema);
module.exports = Customer;
