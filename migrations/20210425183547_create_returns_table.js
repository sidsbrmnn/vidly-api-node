/**
 *
 * @param {import('knex').Knex} knex
 */
exports.up = function (knex) {
  return knex.schema.createTable('returns', function (table) {
    table.increments('id');
    table
      .integer('rental_id')
      .unsigned()
      .references('id')
      .inTable('rentals')
      .onDelete('restrict');
    table.float('fee').notNullable();
    table
      .timestamp('created_at', { useTz: true })
      .defaultTo(knex.fn.now())
      .notNullable();
    table.unique(['rental_id']);
  });
};

/**
 *
 * @param {import('knex').Knex} knex
 */
exports.down = function (knex) {
  return knex.schema.dropTable('returns');
};
