"use strict";

load('jsecma5.js');
load('narcissus/lib/jsdefs.js');
load('narcissus/lib/jslex.js');
load('narcissus/lib/jsparse.js');

var tkn = Narcissus.definitions.tokenIds;

function createTraverseData() {
    var o = [];

    o[tkn.FUNCTION] = ["body"];
    o[tkn.IF] = ["condition", "thenPart", "elsePart"];
    o[tkn.SWITCH] = ["discriminant", "cases"];
    o[tkn.CASE] = ["caseLabel", "statements"];
    o[tkn.DEFAULT] = ["statements"];
    o[tkn.FOR] = ["setup", "condition", "body", "update"];
    o[tkn.WHILE] = ["condition", "body"];
    o[tkn.FOR_IN] = ["varDecl", "iterator", "object", "body"];
    o[tkn.DO] = ["body", "condition"];
    o[tkn.TRY] = ["tryBlock", "catchClauses", "finallyBlock"];
    o[tkn.CATCH] = ["guard", "block"];
    o[tkn.THROW] = ["exception"];
    o[tkn.RETURN] = ["value"];
    o[tkn.WITH] = ["object", "body"];
    o[tkn.SEMICOLON] = ["expression"];
    o[tkn.LABEL] = ["statement"];
    o[tkn.IDENTIFIER] = ["initializer"];
    o[tkn.GETTER] = ["body"];
    o[tkn.SETTER] = ["body"];

    var c = [tkn.SCRIPT,
             tkn.BLOCK, tkn.VAR, tkn.CONST, tkn.COMMA, tkn.ASSIGN,
             tkn.HOOK, tkn.OR, tkn.AND, tkn.BITWISE_OR, tkn.BITWISE_XOR,
             tkn.BITWISE_AND, tkn.EQ, tkn.NE, tkn.STRICT_EQ, tkn.STRICT_NE,
             tkn.LT, tkn.LE, tkn.GE, tkn.GT, tkn.IN, tkn.INSTANCEOF,
             tkn.LSH, tkn.RSH, tkn.URSH, tkn.PLUS, tkn.MINUS, tkn.MUL,
             tkn.DIV, tkn.MOD, tkn.DELETE, tkn.VOID, tkn.TYPEOF,
             tkn.NOT, tkn.BITWISE_NOT, tkn.UNARY_PLUS, tkn.UNARY_MINUS,
             tkn.INCREMENT, tkn.DECREMENT, tkn.DOT, tkn.INDEX,
             tkn.LIST, tkn.CALL, tkn.NEW, tkn.NEW_WITH_ARGS, tkn.ARRAY_INIT,
             tkn.OBJECT_INIT, tkn.PROPERTY_INIT, tkn.GROUP];

    // add "children" to all tokens enumerated in c
    for (var i = 0; i < c.length; i++) {
        if (o[c[i]]) {
            o[c[i]].push("children");
        }
        else {
            o[c[i]] = ["children"];
        }
    }

    return o;
}

var traverseData = createTraverseData();

// visitfns: {pre: function, post: function}
// visit function signature: function(node, level, parent, parentprop)
function traverseAstDFS(node, visitfns, level, parent, parentprop) {
    if (!node) {
        return;
    }
    level = level || 0;
    visitfns.pre && visitfns.pre(node, level, parent, parentprop);

    var subprops = traverseData[node.type];
    // temporary sanity-check
    if (Array.isArray(node.children) && node.children.length > 0 &&
        (!Array.isArray(subprops) || subprops[subprops.length - 1] !== "children")) {
        throw new Error("traverse error "+ tokenString(node.type) +" "+
                        JSON.stringify(subprops) +" "+
                        JSON.stringify(node.children));
    }

    if (subprops) {
        for (var i = 0; i < subprops.length; i++) {
            var prop = subprops[i];
            if (Array.isArray(node[prop])) {
                for (var j = 0, k = node[prop].length; j < k; j++) {
                    traverseAstDFS(node[prop][j], visitfns, level + 1, node, prop + "[" + String(j) + "]");
                }
            }
            else {
                traverseAstDFS(node[prop], visitfns, level + 1, node, prop);
            }
        }
    }

    visitfns.post && visitfns.post(node, level, parent, parentprop);
}

function spaces(n, s) {
    var str = "";
    s = s || " ";
    for (var i = 0; i < n; i++) {
        str += s;
    }
    return str;
}
function tokenString(tt) {
    var defs = Narcissus.definitions;
    var t = defs.tokens[tt];
    return /^\W/.test(t) ? defs.opTypeNames[t] : t.toUpperCase();
}

var src = "x = 1+\n2;\nprint(y);for (s.x in o) {}";
src = "switch(a+b) { case c+d: e+f; case g+h: i+j; default: k+l; }";
src = "try { a+b; } catch (x if c+d) { e+f; } catch (y) { g+h; } finally { i+j; }";
src = "var x = a+b, y = c+d; const z = e+f, w = g+h";
src = "var o = {get prop() { a+b; }, set prop(val) { c+d; }}";
src = "var x = 1, y = 2; f(1, 2); a, function f(a, b) {}; x = a, b;";
src = "a, b, c";
src = "\"no restrict\", function add(a, b) { return a+b; }";
var root = Narcissus.parser.parse(src, "test.js", 0);

function abbrev(str, max) {
    max = Math.max(Number(max) || 3, 3);
    if (str.length <= max) {
        return str;
    }
    var l = Math.ceil((max - 3) / 2);
    var r = Math.floor((max - 3) / 2);
    return str.slice(0, l) +"..."+ str.slice(str.length - r, str.length);
}
traverseAstDFS(root, {pre: function(node, level, parent, parentprop) {
    function strPos(pos) {
        return pos === undefined ? "?" : String(pos);
    }
    var src = node.tokenizer.source;
    print(spaces(level, "  ") +
          (parentprop ? parentprop + ": " : "") +
          tokenString(node.type) +
          ("start" in node && "end" in node ?
           " `"+ abbrev(src.slice(node.start, node.end), 30) +"´" : "") +
          " ("+ strPos(node.start) +".."+ strPos(node.end) +")"
           );
}});
print("done");
