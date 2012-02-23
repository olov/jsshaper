// Tweaks specific to Narcissus:
// Rewrite 'const' to 'var' to play nicely with strict-mode
// Replace 'eval(definitions.consts)' with the literal contents of
//   Narcissus.definitions.consts.
if (typeof define !== 'function') { var define = require('amdefine')(module); }

var log = (typeof console !== "undefined") && console.log || print;

define(['../shaper', '../tkn', '../narcissus'], function(Shaper, tkn, Narcissus) {
"use strict"; "use restrict";

    Shaper("deeval", function(root) {
        var tmpl = Shaper.parse('eval(definitions.consts)');
        return Shaper.traverse(root, {
            pre: function(node, ref) {
                if (Shaper.match(tmpl, node)) {
                    var repl = Shaper.parse(Narcissus.definitions.consts);
                    return ref.set(repl.expression);
                }
            },
            post: function(node, ref) {
                if (node.type === tkn.CONST) {
                    node.type = tkn.VAR;
                    node.srcs[0] = node.srcs[0].replace(/^const/, 'var');
                }
            }
        });
    });

    return Shaper.get("deeval");
});
