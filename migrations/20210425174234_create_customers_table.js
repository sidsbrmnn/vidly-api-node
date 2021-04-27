/**
 *
 * @param {import('knex').Knex} knex
 */
exports.up = function (knex) {
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

/**
 *
 * @param {import('knex').Knex} knex
 */
exports.down = function (knex) {
  return knex.schema.dropTable('customers');
};
