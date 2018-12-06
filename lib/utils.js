const mongoUtils = require('@nexes/mongo-utils');
const nqlLang = require('@nexes/nql-lang');
const cloneDeep = require('lodash.clonedeep');

/**
 * ## Merge Filters
 * Util to combine overrides, default and custom filters based on
 * following hierarchy: overrides -> custom -> defaults
 *
 * overrides - filters which must ALWAYS be applied
 * defaults - filters which must be applied if a matching filter isn't provided
 * custom - custom filters which are additional
 *
 * @TODO:
 *
 * - make function signature more generic to accept any amount of arguments/filters
 * - and then move the function to mongo-utils?
 */
module.exports.mergeFilters = ({overrides, defaults, custom} = {}) => {
    if (custom && !overrides && !defaults) {
        return custom;
    }

    let merged = {};

    if (overrides) {
        merged = overrides;
    }

    if (custom && Object.keys(custom).length > 0) {
        custom = mongoUtils.rejectStatements(custom, (statement) => {
            return mongoUtils.findStatement(merged, statement);
        });

        if (custom) {
            merged = merged ? mongoUtils.combineFilters(merged, custom) : custom;
        }
    }

    if (defaults && Object.keys(defaults).length > 0) {
        defaults = mongoUtils.rejectStatements(defaults, (statement) => {
            return mongoUtils.findStatement(merged, statement);
        });

        if (defaults) {
            merged = merged ? mongoUtils.combineFilters(merged, defaults) : defaults;
        }
    }

    return merged;
};

module.exports.expandFilters = (mongoJSON, expansions) => {
    const expansionsClone = cloneDeep(expansions);

    expansionsClone.forEach((expansion) => {
        if (expansion.expansion) {
            expansion.expansion = nqlLang.parse(expansion.expansion);
        }
    });

    return mongoUtils.expandFilters(mongoJSON, expansionsClone);
};
