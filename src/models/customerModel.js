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
    lastParticipateDate: { type: Date },
  },
  { timestamps: true, toJSON: { virtuals: true } },
);

customerSchema.virtual("orders", {
  ref: "Order",
  localField: "_id",
  foreignField: "customer",
});

customerSchema.statics.checkCustomerInfo = async function ({
  account,
  bankInfo,
}) {
  const customer = await this.findOne({ account });

  const dataFromPlatform = await getCustomerInfo({ account });
  if (!dataFromPlatform.Data) {
    throw new AppError(
      "Không tìm thấy thông tin tài khoản trên nền tảng !!!",
      404,
    );
  }
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
      orders: [],
    };

    const newCustomer = await this.create(data);

    return { ...newCustomer._doc, vipLevel: VipLevel };
  }

  return { ...customer._doc, vipLevel: VipLevel };
};

const Customer = mongoose.model("Customer", customerSchema);
module.exports = Customer;
