"use strict";

load('jsecma5.js');
var Narcissus;
load('narcissus/lib/jsdefs.js');
load('narcissus/lib/jslex.js');
load('narcissus/lib/jsparse.js');

var tkn = Narcissus.definitions.tokenIds;

Array.isArray = Array.isArray || function(o) {
    return Object.prototype.toString.call(o) === '[object Array]';
};

function createTraverseData() {
    var o = [];

    o[tkn.FUNCTION] = ["body"];
    o[tkn.IF] = ["condition", "thenPart", "elsePart"];
    o[tkn.SWITCH] = ["discriminant", "cases"];
    o[tkn.CASE] = ["caseLabel", "statements"];
    o[tkn.DEFAULT] = ["statements"];
    o[tkn.FOR] = ["setup", "condition", "update", "body"];
    o[tkn.WHILE] = ["condition", "body"];
    o[tkn.FOR_IN] = ["varDecl", "iterator", "object", "body"];
    o[tkn.DO] = ["body", "condition"];
    o[tkn.TRY] = ["tryBlock", "catchClauses", "finallyBlock"];
    o[tkn.CATCH] = ["guard", "block"];
    o[tkn.THROW] = ["exception"];
    o[tkn.RETURN] = ["value"];
    o[tkn.YIELD] = ["value"];
    o[tkn.GENERATOR] = ["expression", "tail"];
    o[tkn.WITH] = ["object", "body"];
    o[tkn.SEMICOLON] = ["expression"];
    o[tkn.LABEL] = ["statement"];
    o[tkn.IDENTIFIER] = ["initializer"];
    o[tkn.GETTER] = ["body"];
    o[tkn.SETTER] = ["body"];
    o[tkn.LET_BLOCK] = ["variables", "expression", "block"];
    o[tkn.ARRAY_COMP] = ["expression", "tail"];
    o[tkn.COMP_TAIL] = ["children", "guard"]; // children and custom

    var c = [tkn.SCRIPT,
             tkn.BLOCK, tkn.LET, tkn.VAR, tkn.CONST, tkn.COMMA, tkn.ASSIGN,
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
            throw new Error("createTraverseData: don't know ordering so "+
                            "can't add 'children' to existing traverseData");
        }
        o[c[i]] = ["children"];
    }

    return o;
}

var traverseData = createTraverseData();

// visitfns: {pre: function, post: function}
// visit function signature: function(node, level, parent, parentProp)
function traverseAstDFS_dynamic(node, visitfns, level, parent, parentProp) {
    if (!node) {
        return;
    }
    if (node instanceof Narcissus.parser.Node !== true) {
        throw new Error("traverseAstDFS expected Node, got "+ typeof node +
                       ". parentProp: "+ parentProp);
    }

    level = level || 0;
    var n;
    visitfns.pre && (n = visitfns.pre(node, level, parent, parentProp));
    if (n !== undefined) {
        node = n;
    }

    for (var prop in node) {
        if (!node.hasOwnProperty(prop)) {
            continue;
        }
        if (prop === "funDecls" || prop === "params" || prop === "varDecls" ||
            prop === "target") {
            continue;
        }
        if (node[prop] instanceof Narcissus.parser.Node) {
            traverseAstDFS(node[prop], visitfns, level + 1, node, prop);
        }
        else if (Array.isArray(node[prop])) {
            for (var j = 0, k = node[prop].length; j < k; j++) {
                traverseAstDFS(node[prop][j], visitfns, level + 1, node, prop + "[" + String(j) + "]");
            }
        }
    }

    visitfns.post && visitfns.post(node, level, parent, parentProp);
}
function traverseAstDFS(node, visitfns, level, parent, parentProp) {
    if (!node) {
        return node;
    }
    if (node instanceof Narcissus.parser.Node !== true) {
        throw new Error("traverseAstDFS expected Node, got "+ typeof node +
                       ". parentProp: "+ parentProp);
    }

    level = level || 0;
    visitfns.pre && (node = visitfns.pre(node, level, parent, parentProp) || node);
    // todo add setParent here?

    var subprops = traverseData[node.type] || [];
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

    visitfns.post && (node = visitfns.post(node, level, parent, parentProp) || node);
    // todo add setParent here?

    return node;
}

function spaces(n, s) {
    return (new Array(n + 1)).join(s || " ");
}
function tokenString(tt) {
    var defs = Narcissus.definitions;
    var t = defs.tokens[tt];
    return /^\W/.test(t) ? defs.opTypeNames[t] : t.toUpperCase();
}

function abbrev(str, max) {
    max = Math.max(Number(max) || 3, 3);
    if (str.length <= max) {
        return str;
    }
    var l = Math.ceil((max - 3) / 2);
    var r = Math.floor((max - 3) / 2);
    return str.slice(0, l) +"..."+ str.slice(str.length - r, str.length);
}

function nodeString(node) {
    function strPos(pos) {
        return pos === undefined ? "?" : String(pos);
    }
    var src = node.tokenizer.source;
    return tokenString(node.type) +
        ("srcs" in node ? " ["+ String(node.srcs) +"]" :
         "start" in node && "end" in node ?
         " '"+ abbrev(src.slice(node.start, node.end), 30) +"'" :
         (node.value !== undefined ? " ("+ node.value +")" : "")) +
        ("start" in node || "end" in node ?
         " ("+ strPos(node.start) +".."+ strPos(node.end) +")" : "") +
        ("parenthesized" in node ? " parenthesized": "");
}

function printTree(root) {
    traverseAstDFS(root, {pre: function(node, level, parent, parentProp) {
        print(spaces(level * 2) + (parentProp || "root") +": "+
              nodeString(node));
    }});
}

function setParent(parent, parentProp, node) {
    if (parentProp[parentProp.length - 1] === "]") {
        var leftBracket = parentProp.indexOf("[");
        var index = parentProp.slice(leftBracket + 1,
                                     parentProp.length - 1);
        var base = parentProp.slice(0, leftBracket);
        parent[base][index] = node;
    }
    else {
        parent[parentProp] = node;
    }
}

function newNode(type, tokenizer, props) {
    var node = Object.create(Narcissus.parser.Node.prototype);
    node.tokenizer = tokenizer;
    node.type = type;
    node.children = [];

    if (props !== undefined) {
        for (var prop in props) {
            node[prop] = props[prop];
        }
    }
    //value, lineno, start, end
    return node;
}

function alterTree(root) {
    function replace(node, var_args) {
        var placeholders = [];
        //collect all $ nodes into placeholders array
        traverseAstDFS(node, {pre: function(node, level, parent, parentProp) {
            if (node.type === tkn.IDENTIFIER && node.value === "$") {
                placeholders.push({node: node, parent: parent, parentProp: parentProp});
            }
        }});
        if (arguments.length - 1 !== placeholders.length) {
            throw new Error("replace: placeholders.length mismatch");
        }

        // replace placeholders with new nodes
        for (var i = 0; i < placeholders.length; i++) {
            var o = placeholders[i];
            setParent(o.parent, o.parentProp, arguments[i + 1]);
        }
    }
    var restrictfns = [];
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

    restrictfns[tkn.UNARY_MINUS] = "__neg($)";
    restrictfns[tkn.BITWISE_AND] = "__bitand($, $)";
    restrictfns[tkn.BITWISE_OR] = "__bitor($, $)";
    restrictfns[tkn.BITWISE_XOR] = "__bitxor($, $)";
    restrictfns[tkn.LSH] = "__bitasl($, $)";
    restrictfns[tkn.RSH] = "__bitasr($, $)";
    restrictfns[tkn.URSH] = "__bitlsr($, $)";
    restrictfns[tkn.BITWISE_NOT] = "__bitnot($)";

    // ASSIGN with .assignOp

    traverseAstDFS(root, {pre: function(node, level, parent, parentProp) {
        var replaceNode;
        if (restrictfns[node.type] !== undefined) {
            replaceNode = parseExpression(restrictfns[node.type]);
            if (node.children.length === 1) {
                replace(replaceNode, node.children[0]);
            }
            else {
                replace(replaceNode, node.children[0], node.children[1]);
            }
        }
        else if (node.type === tkn.INCREMENT || node.type === tkn.DECREMENT) {
            var c = node.children[0];
            var __op = node.type === tkn.INCREMENT ? "__inc" : "__dec";
            var __postprefop = (node.postfix ? "__post" : "__pref") + (node.type === tkn.INCREMENT ? "inc" : "dec");

            if (c.type === tkn.IDENTIFIER) { // id++
                if (node.postfix) {
                    replaceNode = parseExpression("__arg0($, $ = "+ __op +"($))");
                    replace(replaceNode, c, c, c);
                }
                else {
                    replaceNode = parseExpression("($ = "+ __op +"($))");
                    replace(replaceNode, c, c);
                }
            }
            else if (c.type === tkn.DOT) { // expr.id++
                var expr = c.children[0];
                var id = c.children[1];
                replaceNode = parseExpression(__postprefop +'($, "'+ id.value +'")');
                replace(replaceNode, expr);
            }
            else if (c.type === tkn.INDEX) { // expr1[expr2]++
                var expr1 = c.children[0];
                var expr2 = c.children[1];
                if (expr2.type === tkn.STRING) {
                    replaceNode = parseExpression(__postprefop +"($, $)");
                }
                else {
                    replaceNode = parseExpression(__postprefop +"($, String($))");
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
                replaceNode = parseExpression(__op +"($, $)");
                replace(replaceNode, lvalue, v);
            }
            else if (lvalue.type === tkn.DOT) { // expr.id += v
                var expr = lvalue.children[0];
                var id = lvalue.children[1];
                replaceNode = parseExpression('__op_set('+ __op +', $, "'+ id.value +'", $)');
                replace(replaceNode, expr, v);
            }
            else if (lvalue.type === tkn.INDEX) { // expr1[expr2] += v
                var expr1 = lvalue.children[0];
                var expr2 = lvalue.children[1];
                if (expr2.type === tkn.STRING) {
                    replaceNode = parseExpression('__op_set('+ __op +', $, $, $)');
                }
                else {
                    replaceNode = parseExpression('__op_set('+ __op +', $, String($), $)');
                }
                replace(replaceNode, expr1, expr2, v);
            }
            else {
                throw new Error("replace: invalid ASSIGN form");
            }
        }
        else {
            // no-op
            return undefined;
        }
        setParent(parent, parentProp, replaceNode);
        return replaceNode;
    }});
}
function adjustStartEnd(root) {
    return traverseAstDFS(root, {post: function(node, level, parent, parentProp) {
        if (parent) {
            if (parent.start === undefined || parent.end === undefined ||
                node.start === undefined || node.end === undefined) {
                throw new Error("adjustStartEnd: undefined start/end");
            }
            parent.start = Math.min(parent.start, node.start);
            parent.end = Math.max(parent.end, node.end);
        }
    }});
}
function srcsify(root) {
    return traverseAstDFS(root, {
        pre: function(node, level, parent, parentProp) {
            node.pos = node.start;
            node.srcs = [];

            if (parent) {
                var src = parent.tokenizer.source;
                parent.srcs.push(src.slice(parent.pos, node.start));
                parent.pos = node.end;
            }
        },
        post: function(node, level, parent, parentProp) {
            var src = node.tokenizer.source;
            node.srcs.push(src.slice(node.pos, node.end));
            delete node.start;
            delete node.end;
            delete node.pos; // weird bug if other deletion order
            node.tokenizer = {source: ""};
            //delete node.tokenizer;
        }
    });
}

Narcissus.parser.Node.prototype.getSrc = function() {
    var srcs = [];
    traverseAstDFS(this, {
        pre: function(node, level, parent, parentProp) {
            if (parent) {
                srcs.push(parent.srcs[parent.nPushed++]);
            }
            node.nPushed = 0;
        },
        post: function(node, level, parent, parentProp) {
            srcs.push(node.srcs[node.nPushed++]);
            delete node.nPushed;
        }
    });
    return srcs.join("");
};

function parse(str) {
    return srcsify(adjustStartEnd(Narcissus.parser.parse(str, "test.js", 1)));
}
function parseExpression(expr) {
    // SCRIPT -> [SEMICOLON ->] expr
    var stmnt = parse(expr).children[0];
    return stmnt.type === tkn.SEMICOLON ? stmnt.expression : stmnt;
}

print("checker.js done");
