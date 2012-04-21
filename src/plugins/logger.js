if (typeof define !== 'function') { var define = require('amdefine')(module); }

define(['../shaper', '../ref', '../tkn'], function(Shaper, Ref, tkn) {
"use strict"; "use restrict";

Shaper("logger", function(root) {
    var fns = [];
    return Shaper.traverse(root, {
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
                var refFirstArg = new Ref(args, "children", 0);
                Shaper.insertBefore(refFirstArg, Shaper.parse('"'+ fnname +'"'));
                Shaper.insertBefore(refFirstArg, Shaper.parse(node.lineno));
                Shaper.insertBefore(refFirstArg, Shaper.parse('"'+ node.tokenizer.filename +'"'));
            }
        },
        post: function(node, ref) {
            if (node.type === tkn.FUNCTION) {
                fns.pop();
            }
        }});
});

    return Shaper.get("logger");
});
