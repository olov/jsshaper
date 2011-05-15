"use strict"; "use restrict";

var Shaper = Shaper || require("shaper.js") || Shaper;

Shaper("add-op-to-call", function(root) {
    var template = Shaper.parseExpression("$ + $");
    return Shaper.traverseTree(root, {pre: function(node, ref) {
        if (Shaper.match(template, node)) { // if (node.type === tkn.PLUS) {
            var call = Shaper.parseExpression("add($, $)");
            Shaper.replace(call, node.children[0], node.children[1]);
            Shaper.cloneComments(call, node);
            return ref.set(call);
        }
    }});
});
