import { Connection } from 'typeorm';
import { Factory, Seeder } from 'typeorm-seeding';
import { Genre } from '../entity/genre';
import { Movie } from '../entity/movie';

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

class CreateMovies implements Seeder {
  public async run(factory: Factory, connection: Connection): Promise<void> {
    for (const genre of genres) {
      const { identifiers } = await connection
        .getRepository(Genre)
        .insert({ name: genre.name });

      await connection.getRepository(Movie).insert(
        genre.movies.map((movie) => ({
          ...movie,
          genre: identifiers[0],
        }))
      );
    }
  }
}

export default CreateMovies;
