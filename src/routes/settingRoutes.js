const express = require("express");
const {
  getSettings,
  updateOrCreateSettings,
} = require("../controllers/settingController");
const authController = require("../controllers/authController");

const router = express.Router();

router.use(authController.protect);

router.get("/", getSettings);
router.post("/", updateOrCreateSettings);

module.exports = router;
