const utils = require('../../lib/utils');

describe('Utils', function () {
    describe('Merge filters', () => {
        it('should return empty statement object when there are no filters', () => {
            utils.mergeFilters().should.eql({});
        });

        describe('single filters', () => {
            it('should return only overrides filter when it is passed', () => {
                const input = {
                    overrides: {status: 'published'}
                };

                const output = {
                    status: 'published'
                };

                utils.mergeFilters(input).should.eql(output);
            });

            it('should return only default filter when it is passed', () => {
                const input = {
                    defaults: {status: 'published'}
                };

                const output = {
                    status: 'published'
                };

                utils.mergeFilters(input).should.eql(output);
            });

            it('should return only custom filter when it is passed', () => {
                const input = {
                    custom: {status: 'published'}
                };

                const output = {
                    status: 'published'
                };

                utils.mergeFilters(input).should.eql(output);
            });
        });

        describe('combination of filters', () => {
            it('should merge overrides and default filters if both are provided', () => {
                const input = {
                    overrides: {status: 'published'},
                    defaults: {page: false}
                };
                const output = {$and: [
                    {status: 'published'},
                    {page: false}
                ]};

                utils.mergeFilters(input).should.eql(output);
            });

            it('should combine custom and overrides filters', () => {
                const input = {
                    overrides: {status: 'published'},
                    custom: {tag: 'photo'}
                };
                const output = {$and: [
                    {status: 'published'},
                    {tag: 'photo'}
                ]};

                utils.mergeFilters(input).should.eql(output);
            });

            it('should remove custom filters if matches overrides', () => {
                const input = {
                    overrides: {status: 'published'},
                    custom: {status: 'draft'}
                };
                const output = {status: 'published'};

                utils.mergeFilters(input).should.eql(output);
            });

            it('should reduce custom filters if any matches overrides', () => {
                const input = {
                    overrides: {status: 'published'},
                    custom: {$or: [
                        {tag: 'photo'},
                        {status: 'draft'}
                    ]}
                };
                const output = {$and: [
                    {status: 'published'},
                    {$or: [
                        {tag: 'photo'}
                    ]}
                ]};

                utils.mergeFilters(input).should.eql(output);
            });

            it('should combine default filters if default and custom are provided', () => {
                const input = {
                    defaults: {page: false},
                    custom: {tag: 'photo'}
                };
                const output = {$and: [
                    {tag: 'photo'},
                    {page: false}
                ]};

                utils.mergeFilters(input).should.eql(output);
            });

            it('should reduce default filters if default and custom are same', () => {
                const input = {
                    defaults: {page: false},
                    custom: {page: true}
                };
                const output = {page: true};

                utils.mergeFilters(input).should.eql(output);
            });

            it('should match nested $and with a key inside primary filter', function () {
                const input = {
                    defaults: {
                        $and: [
                            {page: false},
                            {status: 'published'}
                        ]
                    },
                    custom: {
                        page: {
                            $in: [false,true]
                        }
                    }
                };
                const output = {$and: [
                    {page: {
                        $in: [false,true]
                    }},
                    {$and: [
                        {status: 'published'}
                    ]}
                ]};

                utils.mergeFilters(input).should.eql(output);
            });

            it('should reduce default filters if default and custom overlap', () => {
                const input = {
                    defaults: {$or: [
                        {page: false},
                        {author: 'cameron'}
                    ]},
                    custom: {$and: [
                        {tag: 'photo'},
                        {page: true}
                    ]}
                };
                const output = {$and: [
                    {$and: [
                        {tag: 'photo'},
                        {page: true}
                    ]},
                    {$or: [
                        {author: 'cameron'}
                    ]}
                ]};

                utils.mergeFilters(input).should.eql(output);
            });

            it('should return a merger of overrides and defaults plus custom filters if provided', () => {
                const input = {
                    overrides: {status: 'published'},
                    defaults: {page: false},
                    custom: {tag: 'photo'}
                };
                const output = {$and: [
                    {$and: [
                        {status: 'published'},
                        {tag: 'photo'}
                    ]},
                    {page: false}
                ]};

                utils.mergeFilters(input).should.eql(output);
            });

            it('should handle getting overrides, default and multiple custom filters', () => {
                const input = {
                    overrides: {status: 'published'},
                    defaults: {page: true},
                    custom: {$or: [
                        {tag: {
                            $in: ['photo','video']
                        }},
                        {author: 'cameron'}
                    ]}
                };

                const output = {$and: [
                    {
                        $and: [
                            {
                                status: 'published'
                            },
                            {
                                $or: [
                                    {
                                        tag: {$in: ['photo','video']}
                                    },
                                    {
                                        author: 'cameron'
                                    }
                                ]
                            }
                        ]
                    },
                    {
                        page: true
                    }
                ]};

                utils.mergeFilters(input).should.eql(output);
            });

            it('combination of all filters', () => {
                const input = {
                    overrides: {featured: true},
                    defaults: {page: false},
                    custom: {status: {$in: ['draft','published']}}
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
                    {page: false}
                ]};

                utils.mergeFilters(input).should.eql(output);
            });

            it('does not match incorrect custom filters', () => {
                const input = {
                    overrides: {status: 'published'},
                    defaults: {page: false},
                    custom: {$or: [
                        {page: true},
                        {statusstatus: ':5Bdraft%2Cpublished%5D'}
                    ]}
                };
                const output = {$and: [
                    {status: 'published'},
                    {$or: [
                        {page: true},
                        {statusstatus: ':5Bdraft%2Cpublished%5D'}
                    ]}
                ]};

                utils.mergeFilters(input).should.eql(output);
            });
        });
    });

    describe('Expand filters', () => {
        it('should not fail when no expansions provided', () => {
            utils.expandFilters({status: 'draft'}).should.eql({status: 'draft'});
        });

        it('should substitute single alias without expansion', function () {
            const mongoJSON = {primary_tag: 'en'};
            const expansions = [{
                key: 'primary_tag',
                replacement: 'tags.slug'
            }];

            const output = {'tags.slug': 'en'};

            utils.expandFilters(mongoJSON, expansions).should.eql(output);
        });

        it('should substitute single alias', function () {
            const filter = {primary_tag: 'en'};
            const expansions = [{
                key: 'primary_tag',
                replacement: 'tags.slug',
                expansion: `posts_tags.order:0`
            }];

            const processed = {$and: [
                {'tags.slug': 'en'},
                {'posts_tags.order': 0}
            ]};

            utils.expandFilters(filter, expansions).should.eql(processed);
        });

        it('should substitute single alias with multiple expansions', function () {
            const filter = {primary_tag: 'en'};
            const expansions = [{
                key: 'primary_tag',
                replacement: 'tags.slug',
                expansion: 'posts_tags.order:0+tags.visibility:public'
            }];

            const processed = {$and: [
                {'tags.slug': 'en'},
                {'posts_tags.order': 0},
                {'tags.visibility': 'public'}
            ]};

            utils.expandFilters(filter, expansions).should.eql(processed);
        });
    });

    describe('Parse expansions', () => {
        it('should transform single expansion', function () {
            const input = [
                {
                    key: 'primary_authors',
                    replacement: 'users',
                    expansion: 'order:0'
                }
            ];
            const output = [
                {
                    key: 'primary_authors',
                    replacement: 'users',
                    expansion: {order: 0}
                }
            ];

            utils.parseExpansions(input).should.eql(output);
            input.should.eql(input); // input should not be mutated
        });

        it('should transform multiple expansions', function () {
            const input = [
                {
                    key: 'primary_authors',
                    replacement: 'users',
                    expansion: 'order:0'
                },
                {
                    key: 'primary_tags',
                    replacement: 'tags',
                    expansion: 'order:0'
                }
            ];
            const output = [
                {
                    key: 'primary_authors',
                    replacement: 'users',
                    expansion: {order: 0}
                },
                {
                    key: 'primary_tags',
                    replacement: 'tags',
                    expansion: {order: 0}
                }
            ];

            utils.parseExpansions(input).should.eql(output);
            input.should.eql(input); // input should not be mutated
        });
    });
});
