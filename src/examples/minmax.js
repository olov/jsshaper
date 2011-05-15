"use strict"; "use restrict";

var Shaper = Shaper || require("shaper.js") || Shaper;
var Fmt = Fmt || require("fmt.js") || Fmt;

Shaper("minmax", function(root) {
    return Shaper.traverseTree(root, {pre: function(node, ref) {
        if (node.type !== tkn.CALL) {
            return;
        }
        var fn = node.children[0];
        var params = node.children[1].children;
        if (fn.type === tkn.IDENTIFIER && (fn.value === "MIN" || fn.value === "MAX")) {
            var ternary = Shaper.parseExpression(Fmt("(($) {0} ($) ? ($) : ($))", fn.value === "MIN" ? "<" : ">"));
            Shaper.replace(ternary, params[0], params[1], params[0], params[1]);
            return ref.set(ternary);
        }
    }});
});
