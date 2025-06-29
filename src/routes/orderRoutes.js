const express = require("express");
const { default: rateLimit } = require("express-rate-limit");
const {
  getOrders,
  createOrder,
  getOrder,
  updateOrder,
  deleteOrder,
  customerCreateOrder,
} = require("../controllers/orderController");
const authController = require("../controllers/authController");
const customerValidation = require("../middlewares/customerValidation");

const router = express.Router();

// *Client routes
const rateLimitClient = rateLimit({
  max: 10,
  windowMs: 60 * 60 * 1000,
  message: "Too many requests from this IP, please try again in an hour!",
});
router
  .route("/client/:slug")
  .post(
    rateLimitClient,
    authController.customerProtect,
    customerValidation,
    customerCreateOrder,
  );

// !Admin routes
router.use(authController.protect);
router.route("/").get(getOrders).post(createOrder);
router.route("/:id").get(getOrder).patch(updateOrder).delete(deleteOrder);

module.exports = router;
