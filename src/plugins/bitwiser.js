if (typeof define !== 'function') { var define = require('amdefine')(module); }

define(['../shaper','./annotater','../tkn'], function(Shaper, Annotater, tkn) {
"use strict"; "use restrict";

Shaper("bitwiser", function(root) {
    var bitwise_stack = [];
    return Shaper.traverse(root, {
        pre: function(node, ref) {
            if (node.bitwise) {
                bitwise_stack.push(true);
            }
            if (node.type === tkn.BITWISE_OR && bitwise_stack.length === 0) {
                Shaper.error(node, "bitwise or (|) detected without /* @bitwise */ annotation\n"+
                             "  did you mean to use ||?");
            }
            if (node.type === tkn.BITWISE_AND && bitwise_stack.length === 0) {
                Shaper.error(node, "bitwise and (&) detected without /* @bitwise */ annotation\n"+
                             "  did you mean to use &&?");
            }
        },
        post: function(node, ref) {
            if (node.bitwise) {
                bitwise_stack.pop();
            }
        }
    });
});

Annotater(/\/\*+\s*@bitwise\s*\*+\//, function(node, match) {
    node.bitwise = true;
});

return Shaper.get("bitwiser");
});
