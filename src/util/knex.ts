import { knex as Knex } from 'knex';
import knexfile from '../../knexfile';

const knex = Knex(knexfile);

export default knex;
