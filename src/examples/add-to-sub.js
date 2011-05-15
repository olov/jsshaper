"use strict"; "use restrict";

var Shaper = Shaper || require("shaper.js") || Shaper;

Shaper("add-to-sub", function(root) {
    return Shaper.traverseTree(root, {pre: function(node, ref) {
        if (node.type === tkn.PLUS) {
            var minus = Shaper.parseExpression("$ - -($)");
            Shaper.replace(minus, node.children[0], node.children[1]);
            Shaper.cloneComments(minus, node); // keep PLUS comment
            return ref.set(minus);
        }
        return undefined;
    }});
});
