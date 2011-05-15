"use strict"; "use restrict";

var Shaper = Shaper || require("shaper.js") || Shaper;

// converts ""+expr or expr+"" to String(expr)
Shaper("stringconverter", function(root) {
    return Shaper.traverseTree(root, {pre: function(node, ref) {
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

        var call = Shaper.parseExpression("String($)");
        Shaper.replace(call, expr);
        Shaper.cloneComments(call, node);
        return ref.set(call);
    }});
});
