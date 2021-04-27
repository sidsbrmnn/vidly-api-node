import 'jsonwebtoken';
import { Knex } from 'knex';

interface Customer {
  id: number;
  name: string;
  email: string;
  phone: string;
  created_at: string;
}

interface Genre {
  id: number;
  name: string;
  created_at: string;
}

interface Movie {
  id: number;
  title: string;
  genre_id: Genre['id'];
  stock: number;
  rental_rate: number;
  created_at: string;
}

interface TokenPayload {
  iat: number;
  name: string;
  role: 'user' | 'admin';
  sub: string;
}

interface Rental {
  id: number;
  customer_id: Customer['id'];
  movie_id: Movie['id'];
  created_at: string;
}

interface Return {
  id: number;
  rental_id: Rental['id'];
  fee: number;
  created_at: string;
}

interface User {
  id: number;
  name: string;
  email: string;
  password: string;
  role: 'user' | 'admin';
  created_at: string;
}

declare module 'jsonwebtoken' {
  export function verify(
    token: string,
    secretOrPublicKey: Secret,
    options?: VerifyOptions
  ): TokenPayload;
}

declare module 'knex/types/tables' {
  interface Tables {
    customers: Knex.CompositeTableType<
      Customer,
      Pick<Customer, 'name' | 'email' | 'phone'> &
        Partial<Pick<Customer, 'created_at' | 'is_gold'>>,
      Partial<Omit<Customer, 'id'>>
    >;

    genres: Knex.CompositeTableType<
      Genre,
      Pick<Genre, 'name'> & Partial<Pick<Genre, 'created_at'>>,
      Partial<Omit<Genre, 'id'>>
    >;

    movies: Knex.CompositeTableType<
      Movie,
      Pick<Movie, 'title' | 'genre_id' | 'stock' | 'rental_rate'> &
        Partial<Pick<Movie, 'created_at'>>,
      Partial<Omit<Movie, 'id'>>
    >;

    rentals: Knex.CompositeTableType<
      Rental,
      Pick<Rental, 'customer_id' | 'movie_id'> &
        Partial<Pick<Rental, 'created_at'>>,
      Partial<Omit<Rental, 'id'>>
    >;

    returns: Knex.CompositeTableType<
      Return,
      Pick<Return, 'rental_id' | 'fee'> & Partial<Pick<Return, 'created_at'>>,
      Partial<Omit<Return, 'id'>>
    >;

    users: Knex.CompositeTableType<
      User,
      Pick<User, 'name' | 'email' | 'password'> &
        Partial<Pick<User, 'created_at'>>,
      Partial<Omit<User, 'id'>>
    >;
  }
}
