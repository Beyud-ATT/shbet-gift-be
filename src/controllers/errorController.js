const AppError = require("../../utils/appError");

const handleCaseErrorDB = (err) => {
  const message = `Invalid ${err.path}: ${err.value}`;
  return new AppError(message, 400);
};

const handleCastErrorFieldDB = (err) => {
  const message = `Duplicate field value: "${err.keyvalue.name}". Please use another value!`;
  return new AppError(message, 400);
};

const handlevalidationErroDB = (err) => {
  const message = Object.values(err.errors)
    .map((error) => error.message)
    .join(", ");
  return new AppError(message, 400);
};

const handleJWTError = (err) => {
  const message = err;
  return new AppError(message, 401);
};

const handleJWTExpiredError = () =>
  new AppError("Token expired! Please login again", 401);

const sendDevError = (err, req, res) => {
  console.log(err.stack);
  return res.status(err.statusCode).json({
    status: err.status,
    error: err,
    message: err.message,
  });
};

const sendErrorProd = (err, req, res) => {
  if (err.isOperational) {
    return res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    });
  }

  console.log("ERROR NOT OPERATIONAL", err);

  return res.status(500).json({
    status: "error",
    message: "Something went wrong!",
  });
};

module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || "error";

  if (process.env.NODE_ENV === "development") {
    sendDevError(err, req, res);
  } else if (process.env.NODE_ENV === "production") {
    let error = { ...err };
    error.message = err.message;

    if (error.kind === "ObjectId") error = handleCaseErrorDB(error);
    if (error.code === 11000) error = handleCastErrorFieldDB(error);
    if (error._message === "Validation failed")
      error = handlevalidationErroDB(error);
    if (error.name === "JsonWebTokenError") error = handleJWTError(error);
    if (error.name === "TokenExpiredError") error = handleJWTExpiredError();

    sendErrorProd(error, req, res);
  }
};
