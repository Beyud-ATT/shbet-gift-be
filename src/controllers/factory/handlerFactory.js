const mongoose = require("mongoose");
const APIFeature = require("../../../utils/apiFeature");
const AppError = require("../../../utils/appError");
const catchAsync = require("../../../utils/catchAsync");

exports.deleteOne = (Model) =>
  catchAsync(async (req, res, next) => {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return next(new AppError("Invalid ID", 400));
    }

    const doc = await Model.findByIdAndDelete(req.params.id);

    if (!doc) {
      return next(new AppError("No document found with that ID", 404));
    }

    res.status(204).json({
      status: "success",
      data: null,
    });
  });

exports.updateOne = (Model) =>
  catchAsync(async (req, res, next) => {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return next(new AppError("Invalid ID", 400));
    }

    const doc = await Model.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!doc) {
      return next(new AppError("No document found with that ID", 404));
    }

    res.status(200).json({
      status: "success",
      data: doc,
    });
  });

exports.createOne = (Model, customData = {}) =>
  catchAsync(async (req, res, next) => {
    const newDoc = await Model.create({ ...req.body, ...customData });

    res.status(201).json({
      status: "success",
      data: newDoc,
    });
  });

exports.getOne = (Model) =>
  catchAsync(async (req, res, next) => {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return next(new AppError("Invalid ID", 400));
    }

    const doc = await Model.findById(req.params.id);

    if (!doc) {
      return next(new AppError("No document found with that ID", 404));
    }

    res.status(200).json({
      status: "success",
      data: doc,
    });
  });

exports.getAll = (Model, populate) =>
  catchAsync(async (req, res, next) => {
    const features = new APIFeature(Model, req.query);
    features.filter().sort().limit().paginate();

    if (populate) {
      features.query.populate(populate);
    }

    const doc = await features.query;

    const total = await features.aggregateCount();

    res.status(200).json({
      status: "success",
      pagination: {
        total,
        pageIndex: req.query.pageIndex || 1,
        pageSize: req.query.pageSize || 10,
      },
      data: doc,
    });
  });
