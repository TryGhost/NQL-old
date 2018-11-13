require('../utils');
const nql = require('@nexes/nql-lang');
const mingo = require('mingo');
const simpleJSON = require('./mingo/simple');

/**
 * The purpose of this file is to prove that NQL
 * is not just transformed to mongo queries correctly
 * but that this can be used in real world settings to match JSON
 */

const makeQuery = (nqlString, options) => {
    const filter = nql.parse(nqlString, options);
    return new mingo.Query(filter);
};

describe('Integration with Mingo', function () {
    it('should match based on simple id', function () {
        const query = makeQuery('id:3');

        query.test(simpleJSON.posts[0]).should.eql(false);
        query.test(simpleJSON.posts[1]).should.eql(false);
        query.test(simpleJSON.posts[2]).should.eql(true);
        query.test(simpleJSON.posts[3]).should.eql(false);
    });
});
