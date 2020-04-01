const Joi = require('@hapi/joi');
const bcrypt = require('bcrypt');
const mongoose = require('mongoose');

const jwt = require('../util/jwt');

const UserSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    isAdmin: { type: Boolean, default: false },
});

UserSchema.pre('save', async function(next) {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(this.password, salt);
    this.password = hashedPassword;

    next();
});

UserSchema.method('checkPassword', async function(password) {
    const isValidPassword = await bcrypt.compare(password, this.password);
    return isValidPassword;
});

UserSchema.method('generateAuthToken', function() {
    const token = jwt.sign({ _id: this._id, isAdmin: this.isAdmin });
    return token;
});

const User = mongoose.model('user', UserSchema);

/**
 *
 * @param {Object} user
 * @param {string} user.name
 * @param {string} user.email
 * @param {string} user.password
 * @param {boolean} [user.isAdmin]
 */
function validateUser(user) {
    const schema = Joi.object({
        name: Joi.string().required(),
        email: Joi.string()
            .email()
            .password(),
        password: Joi.string().required(),
        isAdmin: Joi.boolean(),
    }).options({ stripUnknown: true });

    return schema.validate(user);
}

module.exports.User = User;
module.exports.validateUser = validateUser;
