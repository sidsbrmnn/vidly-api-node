/**
 *
 * @param {import('knex').Knex} knex
 */
exports.up = function (knex) {
  return knex.schema.createTable('rentals', function (table) {
    table.increments('id');
    table
      .integer('customer_id')
      .unsigned()
      .references('id')
      .inTable('customers')
      .onDelete('restrict');
    table
      .integer('movie_id')
      .unsigned()
      .references('id')
      .inTable('movies')
      .onDelete('restrict');
    table
      .timestamp('created_at', { useTz: true })
      .defaultTo(knex.fn.now())
      .notNullable();
    table.unique(['customer_id', 'movie_id']);
  });
};

/**
 *
 * @param {import('knex').Knex} knex
 */
exports.down = function (knex) {
  return knex.schema.dropTable('rentals');
};
