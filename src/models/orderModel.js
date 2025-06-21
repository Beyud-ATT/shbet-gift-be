const mongoose = require("mongoose");
const Settings = require("./settingModel");

const orderSchema = new mongoose.Schema(
  {
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Customer",
      require: true,
    },
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      require: true,
    },
    address: String,
    note: String,
    status: {
      type: String,
      enum: ["pending", "accepted", "rejected"],
      default: "pending",
    },
    rejectedReason: {
      type: String,
      default: "",
    },
  },
  { timestamps: true },
);

orderSchema.pre(/^find/, function (next) {
  this.populate("customer").populate("product");
  next();
});

const Order = mongoose.model("Order", orderSchema);
module.exports = Order;
