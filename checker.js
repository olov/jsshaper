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
        //collect all # nodes into placeholders array
        traverseAstDFS(node, {pre: function(node, level, parent, parentProp) {
            if (node.type === tkn.PLACEHOLDER) {
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
    traverseAstDFS(root, {pre: function(node, level, parent, parentProp) {
        if (node.type === tkn.PLUS) {
            var replaceNode = parseExpression("__add(#, #)");
            replace(replaceNode, node.children[0], node.children[1]);
            setParent(parent, parentProp, replaceNode);
        }
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
            delete node.pos;
            delete node.start;
            delete node.end;
            node.tokenizer = {source: ""};
//            delete node.tokenizer;
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
