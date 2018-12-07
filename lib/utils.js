const mongoUtils = require('@nexes/mongo-utils');
const nqlLang = require('@nexes/nql-lang');

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
const mergeFilters = ({overrides, defaults, custom} = {}) => {
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

const parseExpansions = (expansions) => {
    if (!expansions) {
        return expansions;
    }

    return expansions.map((expansion) => {
        const parsed = Object.assign({}, expansion);

        if (parsed.expansion) {
            parsed.expansion = nqlLang.parse(expansion.expansion);
        }

        return parsed;
    });
};

const expandFilters = (mongoJSON, expansions) => {
    const parsedExpansions = parseExpansions(expansions);

    return mongoUtils.expandFilters(mongoJSON, parsedExpansions);
};

module.exports = {
    mergeFilters: mergeFilters,
    parseExpansions: parseExpansions,
    expandFilters: expandFilters
};
