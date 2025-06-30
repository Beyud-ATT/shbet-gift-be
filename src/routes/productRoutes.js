const express = require("express");
const { default: rateLimit } = require("express-rate-limit");
const {
  getProducts,
  createProduct,
  getProduct,
  updateProduct,
  deleteProduct,
  getProductsForClient,
  getProductsForClientValidCheck,
} = require("../controllers/productController");
const authController = require("../controllers/authController");
const customerValidation = require("../middlewares/customerValidation");
const { customerLogin } = require("../middlewares/customerLogin");

const router = express.Router();

// *Client routes
const rateLimitClient = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: "Too many requests from this IP, please try again in an hour!",
});
// *API to get product raw data
router.get("/client/:slug", rateLimitClient, getProductsForClient);
// *API to check customer and product
router.post(
  "/client/valid-check/:slug",
  rateLimitClient,
  customerLogin,
  customerValidation,
  getProductsForClientValidCheck,
);

// !Admin routes
router.use(authController.protect);
router.get("/", getProducts);
router.get("/:id", getProduct);
router.post("/", createProduct);
router.patch("/:id", updateProduct);
router.delete("/:id", deleteProduct);

module.exports = router;
