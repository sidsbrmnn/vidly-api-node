const mongoose = require('mongoose');

const RentalSchema = new mongoose.Schema(
  {
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'customer',
    },
    movie: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'movie',
    },
    dateOut: { type: Date, required: true, default: Date.now },
    dateReturned: { type: Date },
    rentalFee: { type: Number, min: 0 },
  },
  { timestamps: true }
);

const Rental = mongoose.model('rental', RentalSchema);

module.exports = Rental;
