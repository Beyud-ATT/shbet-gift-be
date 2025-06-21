const express = require("express");

const router = express.Router();
const ENDPOINT = "/api";

router.use("/auth", require("./authRoutes"));
router.use("/customer", require("./customerRoutes"));
router.use("/setting", require("./settingRoutes"));
router.use("/product", require("./productRoutes"));
router.use("/order", require("./orderRoutes"));

module.exports = (app) => {
  app.use(ENDPOINT, router);
};
