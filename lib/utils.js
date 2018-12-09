const mongoUtils = require('@nexes/mongo-utils');
const nqlLang = require('@nexes/nql-lang');

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
    mergeFilters: mongoUtils.mergeFilters,
    parseExpansions: parseExpansions,
    expandFilters: expandFilters
};
