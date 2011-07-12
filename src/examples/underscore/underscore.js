"use strict"; "use restrict";

var Shaper = Shaper || require("shaper.js") || Shaper;

Shaper("underscore", function(root) {
    return Shaper.traverse(root, {pre: function(node, ref) {
        if (node.type === tkn.IDENTIFIER) { // or: if (Shaper.match("$", node)) {
            Shaper.renameIdentifier(node, "_"+ node.value);
        }
    }});
});
