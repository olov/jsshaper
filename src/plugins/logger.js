"use strict"; "use restrict";

var Shaper = Shaper || require("shaper.js") || Shaper;
var Fmt = Fmt || require("fmt.js") || Fmt;

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
            var args = node.children[1];
            if (callexpr.type === tkn.IDENTIFIER && (callexpr.value === "Log")) {
                node.children[0] = Shaper.parse("Log.verb");

                var fnname = fns.length === 0 ? "<script>" :
                    fns[fns.length - 1].name || "<anonymous>";
                Shaper.insertChild(args, Shaper.parse('"'+ node.tokenizer.filename +'"'), 0);
                Shaper.insertChild(args, Shaper.parse(node.lineno), 1);
                Shaper.insertChild(args, Shaper.parse('"'+ fnname +'"'), 2);
            }
        },
        post: function(node, ref) {
            if (node.type === tkn.FUNCTION) {
                fns.pop();
            }
        }});
});