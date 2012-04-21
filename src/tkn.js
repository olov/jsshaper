if (typeof define !== 'function') { var define = require('amdefine')(module); }

define(['./narcissus'], function(Narcissus) {
    // shortcut for 'tkn' definition
    return Narcissus.definitions.tokenIds;
});
