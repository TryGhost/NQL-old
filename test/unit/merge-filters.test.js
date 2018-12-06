const mergeFilters = require('../../lib/merge-filters');

describe('Merge filters', () => {
    it('should return empty statement object when there are no filters', function () {
        mergeFilters().should.eql({});
    });

    describe('single filters', () => {
        it('should return only enforced filter when it is passed', () => {
            const input = {
                enforced: {status: 'published'}
            };

            const output = {
                status: 'published'
            };

            mergeFilters(input).should.eql(output);
        });

        it('should return only default filter when it is passed', () => {
            const input = {
                defaults: {status: 'published'}
            };

            const output = {
                status: 'published'
            };

            mergeFilters(input).should.eql(output);
        });

        it('should return only custom filter when it is passed', () => {
            const input = {
                custom: {status: 'published'}
            };

            const output = {
                status: 'published'
            };

            mergeFilters(input).should.eql(output);
        });

        it('should return only extra filter when it is passed', () => {
            const input = {
                extra: {status: 'published'}
            };

            const output = {
                status: 'published'
            };

            mergeFilters(input).should.eql(output);
        });
    });

    describe('combination of filters', () => {
        it('should merge enforced and default filters if both are provided', () => {
            const input = {
                enforced: {status:'published'},
                defaults: {page:false}
            };
            const output = {$and: [
                {status:'published'},
                {page:false}
            ]};

            mergeFilters(input).should.eql(output);
        });

        it('should merge extra filter if provided', () => {
            const input = {
                custom: {tag:'photo'},
                extra: {featured:true},
            };
            const output = {$and: [
                {tag:'photo'},
                {featured:true}
            ]};

            mergeFilters(input).should.eql(output);
        });

        it('should combine custom and enforced filters', () => {
            const input = {
                enforced: {status:'published'},
                custom: {tag:'photo'},
            };
            const output = {$and: [
                {status:'published'},
                {tag:'photo'}
            ]};

            mergeFilters(input).should.eql(output);
        });

        it('should remove custom filters if matches enforced', () => {
            const input = {
                enforced: {status:'published'},
                custom: {status:'draft'},
            };
            const output = {status:'published'};

            mergeFilters(input).should.eql(output);
        });

        it('should reduce custom filters if any matches enforced', () => {
            const input = {
                enforced: {status:'published'},
                custom: {$or: [
                    {tag:'photo'},
                    {status:'draft'}
                ]},
            };
            const output = {$and:[
                {status:'published'},
                {$or: [
                    {tag:'photo'}
                ]}
            ]};

            mergeFilters(input).should.eql(output);
        });

        it('should combine default filters if default and custom are provided', () => {
            const input = {
                defaults: {page:false},
                custom: {tag:'photo'},
            };
            const output = {$and:[
                {tag:'photo'},
                {page:false}
            ]};

            mergeFilters(input).should.eql(output);
        });

        it('should reduce default filters if default and custom are same', () => {
            const input = {
                defaults: {page:false},
                custom: {page:true},
            };
            const output = {page:true};

            mergeFilters(input).should.eql(output);
        });

        it('should match nested $and with a key inside primary filter', function () {
            const input = {
                defaults: {
                    $and:[
                        {page:false},
                        {status: 'published'}
                    ]
                },
                custom: {
                    page: {
                        $in:[false,true]
                    }
                }
            };
            const output = {$and: [
                {page: {
                    $in:[false,true]
                }},
                {$and:[
                    {status: 'published'},
                ]}
            ]};

            mergeFilters(input).should.eql(output);
        });

        it('should reduce default filters if default and custom overlap', () => {
            const input = {
                defaults: {$or:[
                    {page:false},
                    {author:'cameron'}
                ]},
                custom: {$and: [
                    {tag: 'photo'},
                    {page: true}
                ]}
            };
            const output = {$and:[
                {$and: [
                    {tag:'photo'},
                    {page:true},
                ]},
                {$or: [
                    {author:"cameron"}
                ]}
            ]};

            mergeFilters(input).should.eql(output);
        });

        it('should return a merger of enforced and defaults plus custom filters if provided', () => {
            const input = {
                enforced: {status:'published'},
                defaults: {page:false},
                custom: {tag:'photo'},
            };
            const output = {$and: [
                {$and: [
                    {status:'published'},
                    {tag:'photo'}
                ]},
                {page:false}
            ]};

            mergeFilters(input).should.eql(output);
        });

        it('should handle getting enforced, default and multiple custom filters', () => {
            const input = {
                enforced: {status:'published'},
                defaults: {page:true},
                custom: {$or:[
                    {tag: {
                        $in:['photo','video']
                    }},
                    {author:'cameron'}
                ]},
                extra: {$or: [
                    {status: 'draft'},
                    {page: false}
                ]}
            };

            const output = {$and: [
                {status: 'published'},
                {$and: [
                    {$or: [
                        {tag: {$in: ['photo','video']}},
                        {author:'cameron'}
                    ]},
                    {$or: [
                        {page: false}
                    ]}
                ]}
            ]};

            mergeFilters(input).should.eql(output);
        });

        it('combination of all filters', () => {
            const input = {
                enforced: {featured:true},
                defaults: {page:false},
                custom: {status:{$in:['draft','published']}},
            };
            const output = {$and: [
                {$and: [
                    {featured: true},
                    {
                        status: {
                            $in: ['draft', 'published']
                        }
                    }
                ]},
                {page: false},
            ]};

            mergeFilters(input).should.eql(output);
        });

        it('does not match incorrect custom filters', () => {
            const input = {
                enforced: {status:'published'},
                defaults: {page:false},
                custom: {$or:[
                    {page:true},
                    {statusstatus:':5Bdraft%2Cpublished%5D'}
                ]}
            };
            const output = {$and: [
                {status: 'published'},
                {$or: [
                    {page:true},
                    {statusstatus:':5Bdraft%2Cpublished%5D'}
                ]}
            ]};

            mergeFilters(input).should.eql(output);
        });

        // TODO: this should be moved into applyDefaultAndCustomFilters test suite
        it.skip('should throw when custom filter is invalid NQL', () => {
            const input = {
                enforced: 'status:published',
                defaults: 'page:false',
                custom: 'statusstatus::[draft,published]'
            };

            should.thrws(() => (mergeFilters(input)));
        });
    });
});
