import type { Knex } from 'knex';

exports.up = function (knex: Knex) {
  return knex.schema.createTable('customers', function (table) {
    table.increments('id');
    table.string('name', 255).notNullable();
    table.string('email', 255).unique().notNullable();
    table.string('phone', 255).unique().notNullable();
    table
      .timestamp('created_at', { useTz: true })
      .defaultTo(knex.fn.now())
      .notNullable();
  });
};

exports.down = function (knex: Knex) {
  return knex.schema.dropTable('customers');
};
