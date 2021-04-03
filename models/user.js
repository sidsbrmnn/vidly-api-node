const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');

/**
 * Compares the plain text password with the encrypted one.
 *
 * @param {string} password - Plain text
 * @returns A promise to be either resolved with the comparision result salt or
 * rejected with an Error
 */
function comparePassword(password) {
  return bcrypt.compare(this.password, password);
}

/**
 * Generates a signed JWT string for the user document.
 *
 * @returns The signed JSON Web Token string
 */
function generateAuthToken() {
  return jwt.sign(
    { name: this.name, role: this.role },
    process.env.JWT_SECRET,
    { subject: this.id }
  );
}

const UserSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['user', 'admin'], default: 'user' },
  },
  {
    timestamps: true,
    toJSON: {
      transform: function (doc, ret) {
        delete ret.password;
        return ret;
      },
    },
  }
);

UserSchema.method('comparePassword', comparePassword);
UserSchema.method('generateAuthToken', generateAuthToken);

UserSchema.pre('save', async function (next) {
  try {
    if (this.isDirectModified('password')) {
      this.password = await bcrypt.hash(this.password, 10);
    }
    next();
  } catch (err) {
    next(err);
  }
});

const User = mongoose.model('user', UserSchema);

module.exports = User;
