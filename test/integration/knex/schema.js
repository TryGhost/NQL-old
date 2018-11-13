const Promise = require('bluebird');
const TABLES = ['posts_tags', 'posts', 'tags', 'users'];

module.exports.up = function (knex) {
    // Before all tests, we load any base data (data that won't change)
    return Promise.resolve()
        .then(() => knex.schema.createTable('posts', (table) => {
            table.increments('id').primary();
            table.string('title', 191).defaultTo('(Untitled)');
            table.boolean('featured').defaultsTo(false);
            table.string('image', 191).nullable();
            table.string('status', 191).nullable();
            table.integer('author_id').unsigned().references('users.id');
        }));
};

module.exports.down = function (knex) {
    return Promise.each(TABLES, table => knex.schema.dropTableIfExists(table));
};

module.exports.tables = TABLES;
