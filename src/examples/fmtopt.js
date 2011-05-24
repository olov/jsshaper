"use strict"; "use restrict";

var Shaper = Shaper || require("shaper.js") || Shaper;
var Fmt = Fmt || require("fmt.js") || Fmt;

Shaper("fmtopt", function(root) {
    return Shaper.traverseTree(root, {pre: function(node, ref) {
        if (node.type !== tkn.CALL) {
            return;
        }
        var fn = node.children[0];
        var params = node.children[1].children;
        if (fn.type === tkn.DOT &&
            fn.children[0].value === "Fmt" && fn.children[1].value === "cat") {
            var a = [];
            for (var i = 0 ; i < params.length; i++) {
                a[i] = params[i].type === tkn.STRING ? "$" : "String($)";
            }
            var add = Shaper.parse(Fmt("({0})", a.join(" + ")));
            params.unshift(add);
            Shaper.replace.apply(null, params);
            return ref.set(add);
        }
    }});
});
