if (typeof define !== 'function') { var define = require('amdefine')(module); }

define(['../../shaper'], function(Shaper) {
"use strict"; "use restrict";

Shaper("add-op-to-call", function(root) {
    var template = Shaper.parse("$ + $");
    return Shaper.traverse(root, {pre: function(node, ref) {
        if (Shaper.match(template, node)) { // if (node.type === tkn.PLUS) {
            var call = Shaper.parse("add($, $)");
            Shaper.replace(call, node.children[0], node.children[1]);
            Shaper.cloneComments(call, node);
            return ref.set(call);
        }
    }});
});

return Shaper.get("add-op-to-call");
});
