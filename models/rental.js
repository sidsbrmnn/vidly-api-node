const Joi = require('@hapi/joi');
const mongoose = require('mongoose');

const RentalSchema = new mongoose.Schema({
    customer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'customer',
        required: true,
    },
    movie: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'movie',
        required: true,
    },
    dateOut: { type: Date, default: Date.now },
    dateReturned: { type: Date, default: null },
    rentalFee: { type: Number, min: 0, default: null },
});

RentalSchema.statics.lookup = function (customer, movie) {
    return this.findOne({ customer, movie })
        .populate({ path: 'movie', select: 'dailyRentalRate' })
        .exec();
};

RentalSchema.methods.return = function () {
    this.dateReturned = new Date();
    const rentalTime = Math.abs(this.dateReturned - this.dateOut);
    const rentalDays = Math.ceil(rentalTime / (1000 * 60 * 60 * 24));
    this.rentalFee = rentalDays * this.movie.dailyRentalRate;
};

const Rental = mongoose.model('rental', RentalSchema);

function validateRental(rental) {
    const schema = Joi.object({
        customer: Joi.string()
            .custom((value) => {
                if (!mongoose.isValidObjectId(value)) {
                    throw new Error('it is not a valid ObjectID');
                }

                return value;
            }, 'Mongoose Object ID')
            .required(),
        movie: Joi.string()
            .custom((value) => {
                if (!mongoose.isValidObjectId(value)) {
                    throw new Error('it is not a valid ObjectID');
                }

                return value;
            }, 'Mongoose Object ID')
            .required(),
    }).options({ stripUnknown: true });

    return schema.validate(rental);
}

module.exports.Rental = Rental;
module.exports.validateRental = validateRental;
