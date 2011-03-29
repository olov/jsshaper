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
            var fn = node.children[0];
            var params = node.children[1].children;
            if (fn.type === tkn.IDENTIFIER && (fn.value === "assert")) {
                var str = Fmt('"{0}, function {1}, file {2}, line {3}"',
                              params[0].getSrc().replace(/"/g, '\\"'),
                              fns.length === 0 ? "<script>" :
                              fns[fns.length - 1].name || "<anonymous>",
                              node.tokenizer.filename,
                              node.lineno);

                params.push(Shaper.parseExpression(str));
                var list = node.children[1];
                list.srcs.splice(1, 0, ", ");
            }
        },
        post: function(node, ref) {
            if (node.type === tkn.FUNCTION) {
                fns.pop();
            }
        }});
});
