const mongoose = require("mongoose");
const Customer = require("./customerModel");
const Product = require("./productModel");

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
    name: String,
    phone: String,
    address: String,
    note: String,
    status: {
      type: String,
      enum: ["pending", "accepted", "rejected", "mailed"],
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

orderSchema.post("save", async function () {
  const customer = await Customer.findById(this.customer);
  customer.lastParticipateDate = new Date();
  await customer.save();

  const productRecord = await Product.findById(this.product);
  productRecord.quantity -= 1;
  await productRecord.save();
});

const Order = mongoose.model("Order", orderSchema);
module.exports = Order;
