const Customer = require("../models/customerModel");
const factory = require("./factory/handlerFactory");

exports.getAllCustomers = factory.getAll(Customer, {
  path: "orders",
  select: "-customer",
});
exports.getCustomer = factory.getOne(Customer);
exports.createCustomer = factory.createOne(Customer);
exports.updateCustomer = factory.updateOne(Customer);
exports.deleteCustomer = factory.deleteOne(Customer);
