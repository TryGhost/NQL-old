const mongoUtils = require('@nexes/mongo-utils');
const nqlLang = require('@nexes/nql-lang');

/**
 * ## Merge Filters
 * Util to combine multiple filters based on the priority how
 * they are passed into the method. For example:
 *      mergeFilter(overrides, custom, defaults);
 * would merge these three filters having overrides on highers priority
 * and defaults on the lowest priority
 *
 * @TODO:
 * - the function to mongo-utils? https://github.com/NexesJS/mongo-utils/issues/4
 */
const mergeFilters = (...filters) => {
    let merged = {};

    filters
        .filter(filter => (!!filter)) // CASE: remove empty arguments if any
        .forEach((filter) => {
            if (filter && Object.keys(filter).length > 0) {
                filter = mongoUtils.rejectStatements(filter, (statement) => {
                    return mongoUtils.findStatement(merged, statement);
                });

                if (filter) {
                    merged = merged ? mongoUtils.combineFilters(merged, filter) : filter;
                }
            }
        });

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
