const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
  },
  description: String,
  quantity: {
    type: Number,
    default: 0,
  },
  requiredDeposit: {
    type: Number,
    default: 0,
  },
  requiredBet: {
    type: Number,
    default: 0,
  },
  image: {
    type: String,
    require: true,
  },
  status: {
    type: Boolean,
    default: true,
  },
});

const Product = mongoose.model("Product", productSchema);
module.exports = Product;
