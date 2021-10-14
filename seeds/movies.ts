import type { Knex } from 'knex';

const genres = [
  {
    name: 'Comedy',
    movies: [
      { title: 'Airplane', stock: 5, rental_rate: 75 },
      { title: 'The Hangover', stock: 10, rental_rate: 75 },
      { title: 'Wedding Crashers', stock: 15, rental_rate: 75 },
    ],
  },
  {
    name: 'Action',
    movies: [
      { title: 'Die Hard', stock: 5, rental_rate: 75 },
      { title: 'Terminator', stock: 10, rental_rate: 75 },
      { title: 'The Avengers', stock: 15, rental_rate: 75 },
    ],
  },
  {
    name: 'Romance',
    movies: [
      { title: 'The Notebook', stock: 5, rental_rate: 75 },
      { title: 'When Harry Met Sally', stock: 10, rental_rate: 75 },
      { title: 'Pretty Woman', stock: 15, rental_rate: 75 },
    ],
  },
  {
    name: 'Thriller',
    movies: [
      { title: 'The Sixth Sense', stock: 5, rental_rate: 75 },
      { title: 'Gone Girl', stock: 10, rental_rate: 75 },
      { title: 'The Others', stock: 15, rental_rate: 75 },
    ],
  },
];

exports.seed = async function (knex: Knex) {
  await knex('movies').truncate();
  await knex('genres').truncate();

  for (const genre of genres) {
    const genre_ids = await knex('genres')
      .insert({ name: genre.name })
      .returning('id');

    const movies = genre.movies.map((movie) => ({
      ...movie,
      genre_id: genre_ids[0],
    }));

    await knex('movies').insert(movies);
  }
};
