const express = require("express");
const rateLimit = require("express-rate-limit");
const {
  getSettings,
  updateOrCreateSettings,
  getMetaLinks,
} = require("../controllers/settingController");
const authController = require("../controllers/authController");

const router = express.Router();

const rateLimitClient = rateLimit({
  max: 50,
  windowMs: 60 * 60 * 1000,
  message: "Too many requests from this IP, please try again in an hour!",
});
router.get("/meta-links", rateLimitClient, getMetaLinks);

router.use(authController.protect);
router.get("/", getSettings);
router.post("/", updateOrCreateSettings);

module.exports = router;
