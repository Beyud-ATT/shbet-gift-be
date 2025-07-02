const Settings = require("../models/settingModel");
const catchAsync = require("../../utils/catchAsync");
const AppError = require("../../utils/appError");

exports.getSettings = catchAsync(async (req, res, next) => {
  const doc = await Settings.findOne({}, { _id: 0, __v: 0 });

  if (!doc) {
    return next(new AppError("No document found with that ID", 404));
  }

  res.status(200).json({
    status: "success",
    data: doc,
  });
});

exports.updateOrCreateSettings = catchAsync(async (req, res, next) => {
  const doc = await Settings.findOneAndUpdate({}, req.body, {
    new: true,
    runValidators: true,
    upsert: true,
  });

  if (!doc) {
    return next(new AppError("No document found with that ID", 404));
  }

  res.status(200).json({
    status: "success",
    data: doc,
  });
});

exports.getMetaLinks = catchAsync(async (req, res, next) => {
  const doc = await Settings.findOne(
    {},
    { _id: 0, __v: 0, vipLevel: 0, status: 0, blacklist: 0 },
  );

  if (!doc) {
    return next(new AppError("No document found with that ID", 404));
  }

  res.status(200).json({
    status: "success",
    data: doc,
  });
});
