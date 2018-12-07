const mingo = require('mingo');
const nql = require('@nexes/nql-lang');
const mongoKnex = require('@nexes/mongo-knex');
const utils = require('./utils');

/**
 * Public API of NQL tools with consistent usage:
 *
 * nql('id:3').toJSON() => {id:3}
 * nql('id:3').queryJSON({test:true, id:3}) => true
 * nql('tags:test', {expansions: {tags: 'tags.slug'}}).toJSON() => {'tags.slug': test}
 * nql('primary_tag:[photo]', {expansions: [
 *     {key: 'primary_tag', replacement: 'tags.slug', expansion: 'order:0'}
 * ]}) => {$and: [{'tags.slug': {$in: ['photo']}}, {order: 0}]}
 *
 * Advanced usage:
 *
 * nql('primary_tag:test', {
 *      relations: {
 *          tags: {
 *              tableName: 'tags',
 *              type: 'manyToMany',
 *              joinTable: 'posts_tags',
 *              joinFrom: 'post_id',
 *              joinTo: 'tag_id'
 *          }
 *      },
 *      expansions: [
 *          {
 *              key: 'primary_tag',
 *              replacement: 'tags.slug',
 *              expansion: 'posts_tags.sort_order:0'
 *          }
 *      ],
 *      overrides: 'status:published',
 *      defaults: 'featured:true'
 *  }).querySQL(knexQueryBuilderObject)
 *
 *  Builds SQL where statement on top of knex Query Builder including:
 *  - combining custom filter 'primary_tag:test' with overrides filter and defaults
 *  - expanding shortcut property 'primary_tag' into 'tags.slug' and adding 'posts_tags.sort_order:0' filter
 *  - builds a where statement with related `tags` table through manyToMany relation
 */
module.exports = (queryString, options = {}) => {
    const api = {};

    // Convert the string to tokens - useful for testing / debugging, maybe for validating?
    api.lex = () => nql.lex(queryString);

    // Parse converts to mongo JSON and caches the result
    api.parse = function () {
        if (!this.filter && queryString) {
            this.filter = nql.parse(queryString);
        }

        let overrides;
        let defaults;

        if (options.overrides) {
            overrides = nql.parse(options.overrides);
        }

        if (options.defaults) {
            defaults = nql.parse(options.defaults);
        }

        let mongoJSON = utils.mergeFilters(overrides, this.filter, defaults);

        if (options.expansions) {
            mongoJSON = utils.expandFilters(mongoJSON, options.expansions);
        }

        return mongoJSON;
    };

    // Use Mingo to apply the query to a JSON object
    // @TODO rethink this naming
    api.queryJSON = function (obj) {
        this.query = this.query || new mingo.Query(api.parse());
        return this.query.test(obj);
    };

    // Use MongoKnex to apply the query to a query builder object
    api.querySQL = qb => mongoKnex(qb, api.parse(), options);

    // Get back the original query string
    api.toString = () => queryString;

    // Alias parse as toJSON()
    api.toJSON = api.parse;

    return api;
};
