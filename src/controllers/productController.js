const factory = require("./factory/handlerFactory");
const Product = require("../models/productModel");
const catchAsync = require("../../utils/catchAsync");
const AppError = require("../../utils/appError");
const { signToken } = require("../../utils/helper");

exports.getProducts = factory.getAll(Product);
exports.createProduct = factory.createOne(Product);
exports.getProduct = factory.getOne(Product);
exports.updateProduct = factory.updateOne(Product);
exports.deleteProduct = factory.deleteOne(Product);

async function checkProduct(slug, next) {
  if (!slug) {
    return next(new AppError("Please provide a slug !!!", 400));
  }
  const doc = await Product.findOne({ status: true, slug });

  if (!doc) {
    return next(new AppError("No document found with that ID", 404));
  }

  return doc;
}

exports.getProductsForClient = catchAsync(async (req, res, next) => {
  const { slug } = req.params;
  const doc = await checkProduct(slug, next);

  res.status(200).json({
    status: "success",
    data: doc,
  });
});

exports.getProductsForClientValidCheck = catchAsync(async (req, res, next) => {
  const {
    customer,
    params: { slug },
  } = req;
  const doc = await checkProduct(slug, next);

  const token = signToken({ id: customer.id, vipLevel: customer.vipLevel });

  res.status(200).json({
    status: "success",
    data: { ...doc._doc, token },
  });
});
