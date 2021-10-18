import { SnakeNamingStrategy } from 'typeorm-naming-strategies';
import type { ConnectionOptions } from 'typeorm-seeding';

const ormconfig: ConnectionOptions = {
  type: 'postgres',
  host: 'localhost',
  port: 5432,
  username: 'postgres',
  password: '',
  database: 'vidly',
  synchronize: true,
  logging: false,
  entities: ['src/entity/**/*.ts'],
  migrations: ['src/migration/**/*.ts'],
  subscribers: ['src/subscriber/**/*.ts'],
  seeds: ['src/seed/**/*.ts'],
  factories: ['src/factory/**/*.ts'],
  namingStrategy: new SnakeNamingStrategy(),
};

export = ormconfig;
