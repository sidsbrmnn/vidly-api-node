import type { Knex } from 'knex';

exports.up = function (knex: Knex) {
  return knex.schema.createTable('users', function (table) {
    table.increments('id');
    table.string('name', 255).notNullable();
    table.string('email', 255).unique().notNullable();
    table.text('password').notNullable();
    table
      .enum('role', ['user', 'admin'], { enumName: 'role', useNative: true })
      .defaultTo('user')
      .notNullable();
    table
      .timestamp('created_at', { useTz: true })
      .defaultTo(knex.fn.now())
      .notNullable();
  });
};

exports.down = function (knex: Knex) {
  return knex.schema.dropTable('users');
};
