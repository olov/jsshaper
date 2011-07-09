"use strict"; "use restrict";

var Shaper = Shaper || require("shaper.js") || Shaper;
var Fmt = Fmt || require("fmt.js") || Fmt;

Shaper("minmax", function(root) {
    var minTempl = Shaper.parse("MIN($, $)");
    var maxTempl = Shaper.parse("MAX($, $)");
    return Shaper.traverse(root, {pre: function(node, ref) {
        var ternary;
        if (Shaper.match(minTempl, node)) {
            ternary = Shaper.parse("(($) < ($) ? ($) : ($))");
        }
        else if (Shaper.match(maxTempl, node)) {
            ternary = Shaper.parse("(($) > ($) ? ($) : ($))");
        }
        else {
            return;
        }
        var params = node.children[1].children;
        Shaper.replace(ternary, params[0], params[1], params[0], params[1]);
        return ref.set(ternary);
    }});
});
