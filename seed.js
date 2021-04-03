const mongoose = require('mongoose');

const Genre = require('./models/genre');
const Movie = require('./models/movie');

const data = [
  {
    name: 'Comedy',
    movies: [
      { title: 'Airplane', numberInStock: 5, dailyRentalRate: 2 },
      { title: 'The Hangover', numberInStock: 10, dailyRentalRate: 2 },
      { title: 'Wedding Crashers', numberInStock: 15, dailyRentalRate: 2 },
    ],
  },
  {
    name: 'Action',
    movies: [
      { title: 'Die Hard', numberInStock: 5, dailyRentalRate: 2 },
      { title: 'Terminator', numberInStock: 10, dailyRentalRate: 2 },
      { title: 'The Avengers', numberInStock: 15, dailyRentalRate: 2 },
    ],
  },
  {
    name: 'Romance',
    movies: [
      { title: 'The Notebook', numberInStock: 5, dailyRentalRate: 2 },
      { title: 'When Harry Met Sally', numberInStock: 10, dailyRentalRate: 2 },
      { title: 'Pretty Woman', numberInStock: 15, dailyRentalRate: 2 },
    ],
  },
  {
    name: 'Thriller',
    movies: [
      { title: 'The Sixth Sense', numberInStock: 5, dailyRentalRate: 2 },
      { title: 'Gone Girl', numberInStock: 10, dailyRentalRate: 2 },
      { title: 'The Others', numberInStock: 15, dailyRentalRate: 2 },
    ],
  },
];

(async function () {
  await mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
  console.log('Connected to MongoDB');

  await Movie.deleteMany({});
  console.log('Purged movies collection');
  await Genre.deleteMany({});
  console.log('Purged genres collection');

  for (let genre of data) {
    const { _id } = await Genre.create({ name: genre.name });
    const movies = genre.movies.map((movie) => ({ ...movie, genre: _id }));
    await Movie.insertMany(movies);
  }
  console.info('Successfully seeded the database with genres and movies');

  await mongoose.disconnect();
})();
