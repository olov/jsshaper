if (typeof define !== 'function') { var define = require('amdefine')(module); }

define(['../../shaper', '../../tkn'], function(Shaper, tkn) {
"use strict"; "use restrict";

var log = (typeof console !== "undefined") && console.log || print;

Shaper("scoper", function(root) {
    var scopes = [];

    function countRead(name, noUnresolvable) {
        rw(name, "r", noUnresolvable);
    }
    function countWrite(name, noUnresolvable) {
        rw(name, "w", noUnresolvable);
    }
    function rw(name, prop, noUnresolvable) {
        for (var i = scopes.length - 1; i >= 0; i--) {
            if (name in scopes[i]) {
                ++scopes[i][name][prop];
                return;
            }
        }
        if (!noUnresolvable) {
            var top = scopes.top();
            if (!top["unresolvable variables"]) {
                top["unresolvable variables"] = {};
            }
            if (!top["unresolvable variables"][name]) {
                top["unresolvable variables"][name] = {r: 0, w: 0};
            }
            ++top["unresolvable variables"][name][prop];
        }
    }

    return Shaper.traverse(root, {
        pre: function(node, ref) {
            var scope = {};
            var i, v;
            // setup scope for SCRIPT, FUNCTION and CATCH nodes (TODO LET)
            if (node.type === tkn.SCRIPT) {
                for (i = 0; i < node.varDecls.length; i++) {
                    v = node.varDecls[i];
                    if (v.type === tkn.ASSIGN) {
                        v = v.children[0];
                    }
                    scope[v.value] = {r: 0, w: 0};
                }
                for (i = 0; i < node.funDecls.length; i++) {
                    v = node.funDecls[i]._name;
                    scope[v.value] = {r: 0, w: 0};
                }
                if (ref.base && ref.base.type === tkn.FUNCTION) {
                    // FUNCTION node already created a scope with its parameters
                    // so lets merge SCRIPT scope with that
                    var fnScope = scopes.pop();
                    for (i in scope) {
                        fnScope[i] = scope[i];
                    }
                    scope = fnScope;
                }
                scopes.push(scope);
            }
            else if (node.type === tkn.FUNCTION) {
                for (i = 0; i < node._params.length; i++) {
                    v = node._params[i];
                    scope[v.value] = {r: 0, w: 0};
                }
                scopes.push(scope);
            }
            else if (node.type === tkn.CATCH) {
                v = node._name;
                scope[v.value] = {r: 0, w: 0};
                scopes.push(scope);
            }


            // the scope is set up, let's count IDENTIFIER read and writes
            if (node.type === tkn.IDENTIFIER) {
                var rbt = ref.base.type;
                if (rbt === tkn.INCREMENT || rbt === tkn.DECREMENT) {
                    countRead(node.value); countWrite(node.value);
                }
                else if (rbt === tkn.DOT && ref.properties[1] === "1") { // expr.IDENTIFIER (ref.properties[0] === "children")
                    // noop
                }
                else if (rbt === tkn.PROPERTY_INIT && ref.properties[1] === "0") { // IDENTIFIER: expr (ref.properties[0] === "children")
                    // noop
                }
                else if (rbt === tkn.CATCH) {
                    countWrite(node.value);  // registers catch variable _name
                }
                else if (rbt === tkn.FUNCTION) {
                    countWrite(node.value); // registers function name, _params
                }
                else if (rbt === tkn.VAR || rbt === tkn.LET || rbt === tkn.CONST) { // var IDENTIFIER (no initializer)
                    countWrite(node.value); // count var x; as a write since it gets a default value
                }
                else if (rbt === tkn.ASSIGN && ref.properties[1] === 0) { // IDENTIFIER = expr (ref.properties[0] === "children")
                    if (ref.base.assignOp) {
                        countRead(node.value); // += and the like counts as a read then write
                    }
                    countWrite(node.value);
                }
                else if (rbt === tkn.FOR_IN && ref.properties[0] === "_iterator") {
                    countWrite(node.value); // registers for-in _iterator
                }
                else if (rbt === tkn.TYPEOF) {
                    // handle typeof specially since typeof x should register as
                    // a read when x is resolvable, but shouldn't register as an
                    // unresolvable read when x isn't
                    // TODO support parenthesized <typeof (unresolvable)> as well
                    countRead(node.value, true);
                }
                else {
                    // everything else should count as an identifier read
                    countRead(node.value);
                }
            }
        },
        post: function(node, ref) {
            // pop scope and print info
            if (node.type === tkn.SCRIPT || node.type === tkn.CATCH) {
                var scope = scopes.pop();
                log("scope variables: "+ JSON.stringify(scope));
            }
        }});
});

return Shaper.get("scoper");
});
