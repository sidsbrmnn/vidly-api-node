const Joi = require('@hapi/joi');
const mongoose = require('mongoose');

const CustomerSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phone: { type: String, required: true },
    isGold: { type: Boolean, default: false },
});

const Customer = mongoose.model('customer', CustomerSchema);

/**
 *
 * @param {Object} customer
 * @param {string} customer.name
 * @param {string} customer.email
 * @param {string} customer.phone
 * @param {boolean} [customer.isGold]
 */
function validateCustomer(customer) {
    const schema = Joi.object({
        name: Joi.string().required(),
        email: Joi.string().email().required(),
        phone: Joi.string().required(),
        isGold: Joi.boolean(),
    }).options({ stripUnknown: true });

    return schema.validate(customer);
}

module.exports.Customer = Customer;
module.exports.validateCustomer = validateCustomer;
