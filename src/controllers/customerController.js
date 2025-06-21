const Customer = require("../models/customerModel");
const factory = require("./factory/handlerFactory");

exports.getAllCustomers = factory.getAll(Customer);
exports.getCustomer = factory.getOne(Customer);
exports.createCustomer = factory.createOne(Customer, {
  lastParticipateDate: Date.now(),
});
exports.updateCustomer = factory.updateOne(Customer);
exports.deleteCustomer = factory.deleteOne(Customer);
