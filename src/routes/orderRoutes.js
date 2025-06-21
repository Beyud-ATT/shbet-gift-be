const express = require("express");
const {
  getOrders,
  createOrder,
  getOrder,
  updateOrder,
  deleteOrder,
  customerCreateOrder,
} = require("../controllers/orderController");
const authController = require("../controllers/authController");

const router = express.Router();

router
  .route("/customer")
  .post(authController.customerProtect, customerCreateOrder);

router.use(authController.protect);
router.route("/").get(getOrders).post(createOrder);
router.route("/:id").get(getOrder).patch(updateOrder).delete(deleteOrder);

module.exports = router;
