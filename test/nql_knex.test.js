require('./utils');
const nql = require('@nexes/nql-lang');
const mongoToKnex = require('@nexes/mongo-knex');
const knex = require('knex')({client: 'mysql'});
/**
 * The purpose of this file is to prove that NQL
 * is not just transformed to mongo queries correctly
 * but that this can be used in real world settings to query SQL databases
 */

const makeQuery = (nqlString, options) => {
    const postKnex = knex('posts');
    const filter = nql.parse(nqlString, options);

    return mongoToKnex(postKnex, filter, {});
};

describe('Integration with Knex', function () {
    it('should match based on simple id', function () {
        const query = makeQuery('id:3');

        query.toQuery().should.eql('select * from `posts` where `posts`.`id` = 3');
    });
});
