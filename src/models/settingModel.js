const mongoose = require("mongoose");

const settingSchema = new mongoose.Schema({
  vipLevel: {
    type: Number,
    default: 0,
  },
  blacklist: {
    type: String,
    default: "",
  },
});

const Setting = mongoose.model("Setting", settingSchema);
module.exports = Setting;
