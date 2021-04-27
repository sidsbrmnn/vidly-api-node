/**
 *
 * @param {import('knex').Knex} knex
 */
exports.up = function (knex) {
  return knex.schema.createTable('movies', function (table) {
    table.increments('id');
    table.string('title', 255).notNullable();
    table
      .integer('genre_id')
      .unsigned()
      .references('id')
      .inTable('genres')
      .onDelete('restrict');
    table.integer('stock').notNullable();
    table.float('rental_rate').notNullable();
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
  return knex.schema.dropTable('movies');
};
