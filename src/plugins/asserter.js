"use strict"; "use restrict";

var Shaper = Shaper || require("../shaper.js") || Shaper;
var Fmt = Fmt || require("../fmt.js") || Fmt;

Shaper("asserter", function(root) {
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
            // shape assert(), Assert(), assert.anything() and Assert.anything() calls
            if (callexpr.type === tkn.IDENTIFIER && callexpr.value.toLowerCase() === "assert" ||
                callexpr.type === tkn.DOT && callexpr.children[0].type === tkn.IDENTIFIER &&
                callexpr.children[0].value.toLowerCase() === "assert") {
                var params = node.children[1].children;
                var str = Fmt('"{0}, function {1}, file {2}, line {3}"',
                              params[0].getSrc().replace(/"/g, '\\"'),
                              fns.length === 0 ? "<script>" :
                              fns[fns.length - 1].name || "<anonymous>",
                              node.tokenizer.filename,
                              node.lineno);

                Shaper.insertArgument(node, Shaper.parseExpression(str), -1);
            }
        },
        post: function(node, ref) {
            if (node.type === tkn.FUNCTION) {
                fns.pop();
            }
        }});
});
