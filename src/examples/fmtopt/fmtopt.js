if (typeof define !== 'function') { var define = require('amdefine')(module); }

define(['../../shaper', '../../fmt', '../../tkn'], function(Shaper, Fmt, tkn) {
"use strict"; "use restrict";

Shaper("fmtopt", function(root) {
    var templ = Shaper.parse("Fmt.cat($$)");
    return Shaper.traverse(root, {pre: function(node, ref) {
        if (Shaper.match(templ, node)) {
            var params = node.children[1].children;
            var a = [];
            for (var i = 0 ; i < params.length; i++) {
                a[i] = params[i].type === tkn.STRING ? "$" : "String($)";
            }
            var add = Shaper.parse("("+ a.join(" + ") +")");
            params.unshift(add);
            Shaper.replace.apply(null, params);
            return ref.set(add);
        }
    }});
});

return Shaper.get("fmtopt");
});
