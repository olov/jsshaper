"use strict"; "use restrict";

var Shaper = Shaper || require("../shaper.js") || Shaper;
var Fmt = Fmt || require("../fmt.js") || Fmt;

Shaper("logger", function(root) {
    var fns = [];
    return Shaper.traverseTree(root, {
        pre: function(node, ref) {
            if (node.type === tkn.FUNCTION) {
                fns.push(node);
            }
            if (node.type !== tkn.CALL) {
                return;
            }
            var callexpr = node.children[0];
            if (callexpr.type === tkn.IDENTIFIER && (callexpr.value === "Log")) {
                node.children[0] = Shaper.parseExpression("Log.verb");

                var fnname = fns.length === 0 ? "<script>" :
                    fns[fns.length - 1].name || "<anonymous>";
                Shaper.insertArgument(node, Shaper.parseExpression('"'+ node.tokenizer.filename +'"'), 0);
                Shaper.insertArgument(node, Shaper.parseExpression(node.lineno), 1);
                Shaper.insertArgument(node, Shaper.parseExpression('"'+ fnname +'"'), 2);
            }
        },
        post: function(node, ref) {
            if (node.type === tkn.FUNCTION) {
                fns.pop();
            }
        }});
});
