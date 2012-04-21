if (typeof define !== 'function') { var define = require('amdefine')(module); }

define(['./jsecma5', './narcissus/lib/n', './narcissus/lib/jsparse'], function(_, Narcissus, parser) {

    // from former jsmods.js:
    // module keyword is removed so that it parses like any identifier
    // (node uses 'module'; for example in the amdefine statement above)
    delete Narcissus.definitions.tokens.module;
    delete Narcissus.definitions.keywords.module;
    delete Narcissus.definitions.tokenIds.module;
    // jsmods.js used to define tkn as a global; we've added the
    // shortcut module 'tkn.js' instead.

    // don't use const; it doesn't work in strict mode
    Narcissus.hostSupportsEvalConst = false;

    return Narcissus;
});
