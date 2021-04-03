const mongoose = require('mongoose');

const MovieSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    genre: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'genre',
    },
    numberInStock: { type: Number, required: true, min: 0 },
    dailyRentalRate: { type: Number, required: true, min: 0 },
  },
  { timestamps: true }
);

const Movie = mongoose.model('movie', MovieSchema);

module.exports = Movie;
