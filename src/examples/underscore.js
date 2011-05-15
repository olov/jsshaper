"use strict"; "use restrict";

var Shaper = Shaper || require("shaper.js") || Shaper;

Shaper("underscore", function(root) {
    return Shaper.traverseTree(root, {pre: function(node, ref) {
        if (node.type === tkn.IDENTIFIER) {
            Shaper.renameIdentifier(node, "_"+ node.value);
        }
    }});
});
