"use strict"; "use restrict";

var load, require = require || load;
var Shaper = Shaper || require("./shaper.js") || Shaper;
var Annotater = Annotater || require("./annotater.js") || Annotater;

function restrictChecker(root) {
    var restrictfns = [];
    restrictfns[tkn.EQ] = "__eq($, $)";
    restrictfns[tkn.NE] = "__ne($, $)";
    restrictfns[tkn.LT] = "__lt($, $)";
    restrictfns[tkn.GT] = "__gt($, $)";
    restrictfns[tkn.LE] = "__le($, $)";
    restrictfns[tkn.GE] = "__ge($, $)";

    restrictfns[tkn.PLUS] = "__add($, $)";
    restrictfns[tkn.MINUS] = "__sub($, $)";
    restrictfns[tkn.MUL] = "__mul($, $)";
    restrictfns[tkn.DIV] = "__div($, $)";
    restrictfns[tkn.MOD] = "__mod($, $)";

    // INCREMENT, DECREMENT prefix, postfix

    restrictfns[tkn.UNARY_PLUS] = "__uplus($)";
    restrictfns[tkn.UNARY_MINUS] = "__neg($)";
    restrictfns[tkn.BITWISE_AND] = "__bitand($, $)";
    restrictfns[tkn.BITWISE_OR] = "__bitor($, $)";
    restrictfns[tkn.BITWISE_XOR] = "__bitxor($, $)";
    restrictfns[tkn.LSH] = "__bitasl($, $)";
    restrictfns[tkn.RSH] = "__bitasr($, $)";
    restrictfns[tkn.URSH] = "__bitlsr($, $)";
    restrictfns[tkn.BITWISE_NOT] = "__bitnot($)";

    // ASSIGN with .assignOp

    var useRestrictStack = [false]; // TODO change default via options
    function checkerPost(node, ref) {
        if (node.type === tkn.SCRIPT) {
            useRestrictStack.pop();
        }
    }
    function checkerPre(node, ref) {
        // don't alter /*loose*/ annotated nodes or children
        if (node.loose) {
            return "stop-traversal";
        }

        // detect "use restrict"; literal in beginning of script/function
        if (node.type === tkn.SCRIPT) {
            var inRestrict = useRestrictStack.top();
            for (var i = 0; i < node.children.length; i++) {
                var c = node.children[i];
                if (!(c.type === tkn.SEMICOLON &&
                      c.expression.type === tkn.STRING)) {
                    break;
                }
                if (c.expression.value.search("^use restrict") === 0) {
                    inRestrict = c.expression.value;
                    break;
                }
            }
            useRestrictStack.push(inRestrict);
        }

        // don't alter node if we're not in restrict mode (but continue traversal)
        if (useRestrictStack.top() === false) {
            return undefined;
        }

        var replaceNode;
        if (restrictfns[node.type] !== undefined) {
            replaceNode = Shaper.parseExpression(restrictfns[node.type]);
            if (node.children.length === 1) {
                Shaper.replace(replaceNode, node.children[0]);
            }
            else {
                Shaper.replace(replaceNode, node.children[0], node.children[1]);
            }
        }
        // ++ -- += -= *= /= %= &= |= ^= <<= >>= >>>=
        //
        // id += v is translated into id = __add(id, v)
        // expr.id += v is translated into __op_set(__add, expr, "id", v)
        // expr1[expr2] += v is translated into __op_set(__add, expr1, String(expr2), v)
        //
        // ++id is translated into (id = __inc(id))
        // ++expr.id is translated into __prefinc(expr, "id")
        // ++expr1[expr2] is translated into __prefinc(expr1, String(expr2))
        //
        // id++ is translated into __arg0(id, id = __inc(id))
        // expr.id++ is translated into __postinc(expr, "id")
        // expr1[expr2]++ is translated into __postinc(expr1, String(expr2))
        //
        // all other forms, for example ofn() += 1, throws ReferenceError so
        // give translation error
        else if (node.type === tkn.INCREMENT || node.type === tkn.DECREMENT) {
            var c = node.children[0];
            var __op = node.type === tkn.INCREMENT ? "__inc" : "__dec";
            var __postprefop = (node.postfix ? "__post" : "__pref") + (node.type === tkn.INCREMENT ? "inc" : "dec");

            if (c.type === tkn.IDENTIFIER) { // id++
                if (node.postfix) {
                    replaceNode = parseExpression(Fmt("__arg0($, $ = {0}($))", __op));
                    replace(replaceNode, c, c, c);
                }
                else {
                    replaceNode = parseExpression(Fmt("($ = {0}($))", __op));
                    replace(replaceNode, c, c);
                }
            }
            else if (c.type === tkn.DOT) { // expr.id++
                var expr = c.children[0];
                var id = c.children[1];
                replaceNode = parseExpression(Fmt('{0}($, "{1}")', __postprefop, id.value));
                replace(replaceNode, expr);
            }
            else if (c.type === tkn.INDEX) { // expr1[expr2]++
                var expr1 = c.children[0];
                var expr2 = c.children[1];
                if (expr2.type === tkn.STRING) {
                    replaceNode = parseExpression(Fmt("{0}($, $)", __postprefop));
                }
                else {
                    replaceNode = parseExpression(Fmt("{0}($, String($))", __postprefop));
                }
                replace(replaceNode, expr1, expr2);
            }
            else {
                throw new Error("replace: invalid INCREMENT/DECREMENT form");
            }
        }
        else if (node.type === tkn.ASSIGN && node.assignOp) {
            var lvalue = node.children[0];
            var v = node.children[1];
            var __opcall = restrictfns[node.assignOp];
            var __op = __opcall.slice(0, __opcall.indexOf("("));

            if (lvalue.type === tkn.IDENTIFIER) { // id += v
                replaceNode = parseExpression(Fmt("$ = {0}($, $)", __op));
                replace(replaceNode, lvalue, lvalue, v);
            }
            else if (lvalue.type === tkn.DOT) { // expr.id += v
                var expr = lvalue.children[0];
                var id = lvalue.children[1];
                replaceNode = parseExpression(Fmt('__op_set({0}, $, "{1}", $)', __op, id.value));
                replace(replaceNode, expr, v);
            }
            else if (lvalue.type === tkn.INDEX) { // expr1[expr2] += v
                var expr1 = lvalue.children[0];
                var expr2 = lvalue.children[1];
                if (expr2.type === tkn.STRING) {
                    replaceNode = parseExpression(Fmt('__op_set({0}, $, $, $)', __op));
                }
                else {
                    replaceNode = parseExpression(Fmt('__op_set({0}, $, String($), $)', __op));
                }
                replace(replaceNode, expr1, expr2, v);
            }
            else {
                throw new Error("replace: invalid ASSIGN form");
            }
        }
//         else if (node.type === tkn.EQ) {
//             error(node, "== used without /**loose*/ annotation, did you mean === ?\n  Replace with === for strict equal or add annotation if loose equal with type-coercion was intended.");
//             return undefined;
//         }
//         else if (node.type === tkn.NE) {
//             error(node, "!= used without /**loose*/ annotation, did you mean !== ?\n  Replace with !== for strict not-equal or add annotation if loose not-equal with type-coercion was intended.");
//             return undefined;
//         }
        else {
            // no-op
            return undefined;
        }
        ref.set(replaceNode);
        return replaceNode;
    }
    return Shaper.traverseTree(root, {pre: checkerPre, post: checkerPost});
}

Annotater.annotate(/\/\*+\s*loose\s*\*+\//, function(node, match) {
    node.loose = true;
});
Shaper.shape(restrictChecker);
