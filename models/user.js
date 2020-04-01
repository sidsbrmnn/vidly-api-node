const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');

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
    const secretKey = process.env.JWT_SECRET || 'some_secret';
    const token = jwt.sign({ _id: this._id, isAdmin: this.isAdmin }, secretKey);
    return token;
});

const User = mongoose.model('user', UserSchema);

module.exports = User;