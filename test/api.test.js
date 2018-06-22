require('./utils');

const nql = require('../lib/nql');
const knex = require('knex')({client: 'mysql'});

describe('Public API', function () {
    /**
     nql('id:3').lex()
     nql('id:3').parse()
     nql('id:3').queryJSON({});
     nql('id:3').querySQL(knex('posts'));
     nql('id:3').toJSON();

     // In future?
     nql('id:3').merge('title:6');
     */

    it('quick api demo', function () {
        const query = nql('id:3');

        query.toJSON().should.eql({id: 3});
        query.toString().should.eql('id:3');

        query.queryJSON({id: 5}).should.be.false();
        query.queryJSON({id: 3, name: 'kate'}).should.be.true();

        query.querySQL(knex('posts')).toQuery().should.eql('select * from `posts` where `posts`.`id` = 3');
    });
});

describe.skip('Potential Future API', function () {
    it('does not work this way yet', function () {
        // const nql = new nql.Env({
        //     aliases: {author: 'author.slug', tags: 'tags.slug', tag: 'tags.slug', authors: 'authors.slug'}
        // });
        //
        // nql('tag:test')
        //   .toSQL(knex('posts'))
        //   .should.eql('
        //       select * from `posts`
        //         left join `posts_tags` on `posts`.`id` = `posts_tags`.`posts_id`
        //         left join `tags` on `tags`.`id` = `posts_tags`.`tags_id`
        //         where `tags`.`slug` = \'test\'
        // ');
    });
});
