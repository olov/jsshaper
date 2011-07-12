"use strict"; "use restrict";

var Shaper = Shaper || require("shaper.js") || Shaper;

Shaper("add-to-sub", function(root) {
    var templ = Shaper.parse("$ + $");
    return Shaper.traverse(root, {pre: function(node, ref) {
        if (Shaper.match(templ, node)) { // same as: if (node.type === tkn.PLUS) {
            var minus = Shaper.parse("$ - -($)");
            Shaper.replace(minus, node.children[0], node.children[1]);
            Shaper.cloneComments(minus, node); // keep PLUS comment
            return ref.set(minus);
        }
    }});
});
