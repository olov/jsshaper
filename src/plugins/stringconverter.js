if (typeof define !== 'function') { var define = require('amdefine')(module); }

define(['../shaper', '../tkn'], function(Shaper, tkn) {
"use strict"; "use restrict";

// converts ""+expr or expr+"" to String(expr)
Shaper("stringconverter", function(root) {
    return Shaper.traverse(root, {pre: function(node, ref) {
        if (node.type !== tkn.PLUS) {
            return;
        }
        var l = node.children[0];
        var r = node.children[1];
        var expr = (l.type === tkn.STRING && l.value === "") ? r :
            (r.type === tkn.STRING && r.value === "") ? l : null;
        if (expr === null) {
            return;
        }

        var call = Shaper.parse("String($)");
        Shaper.replace(call, expr);
        Shaper.cloneComments(call, node);
        return ref.set(call);
    }});
});

return Shaper.get("stringconverter");
});
