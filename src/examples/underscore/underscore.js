if (typeof define !== 'function') { var define = require('amdefine')(module); }

define(['../../shaper', '../../tkn'], function(Shaper, tkn) {
"use strict"; "use restrict";

Shaper("underscore", function(root) {
    return Shaper.traverse(root, {pre: function(node, ref) {
        if (node.type === tkn.IDENTIFIER) { // or: if (Shaper.match("$", node)) {
            Shaper.renameIdentifier(node, "_"+ node.value);
        }
    }});
});

return Shaper.get("underscore");
});
