const mongoose = require('mongoose');

const CustomerSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phone: { type: String, required: true, unique: true },
    isGold: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const Customer = mongoose.model('customer', CustomerSchema);

module.exports = Customer;
