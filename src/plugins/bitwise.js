"use strict"; "use restrict";

var Shaper = Shaper || require("../shaper.js") || Shaper;
var Annotater = Annotater || require("../annotater.js") || Annotater;

Shaper("bitwise", function(root) {
    var bitwise_stack = [];
    return Shaper.traverseTree(root, {
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
