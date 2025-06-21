const mongoose = require("mongoose");
const dotenv = require("dotenv");

process.on("uncaughtException", (err) => {
  console.log("Uncaught Exception ✈️ Shutting down...");
  console.log(err);
  process.exit(1);
});

dotenv.config();
const app = require("./app");

const DB = process.env.DATABASE_LOCAL.replace(
  "<password>",
  process.env.DATABASE_PASSWORD,
);

mongoose.connect(DB).then(() => {
  console.log("DB connection successful");
});

const port = process.env.PORT || 3000;
const server = app.listen(port, () => {
  console.log(`Server is running on port ${port} ...`);
});

process.on("unhandledRejection", (err) => {
  console.log("Unhandled Rejection ⚠️ Shutting down...");
  console.log(err.name, err.message);
  server.close(() => {
    process.exit(1);
  });
});
