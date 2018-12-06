const _ = require('lodash');
const mongoUtils = require('@nexes/mongo-utils');

/**
 * ## Merge Filters
 * Util to combine enforced, default and custom filters based on
 * following hierarchy: enforced -> (custom + extra) -> defaults
 *
 * enforced - filters which must ALWAYS be applied
 * defaults - filters which must be applied if a matching filter isn't provided
 * custom - custom filters which are additional
 * extra - filters coming from model filter aliases
 *
 * TODO: make function signature more generic to accept any amount of arguments
 */
const mergeFilters = ({enforced, defaults, custom} = {}) => {
    if (custom && !enforced && !defaults) {
        return custom;
    }

    let merged = {};

    if (enforced) {
        merged = enforced;
    }

    if (custom) {
        mongoUtils.merge(merged, custom);

        if (custom && Object.keys(custom).length > 0) {
            merged = merged ? mongoUtils.combineFilters(merged, custom) : custom;
        }
    }

    if (defaults) {
        defaults = mongoUtils.rejectStatements(defaults, (statement) => {
            return mongoUtils.findStatement(merged, statement);
        });

        if (defaults && Object.keys(defaults).length > 0) {
            merged = merged ? mongoUtils.combineFilters(merged, defaults) : defaults;
        }
    }

    return merged;
};

module.exports = mergeFilters;
