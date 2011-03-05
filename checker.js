"use strict"; "use restrict";

load("jsecma5.js");
var Narcissus;
load("narcissus/lib/jsdefs.js");
load("narcissus/lib/jslex.js");
load("narcissus/lib/jsparse.js");

var tkn = Narcissus.definitions.tokenIds;

Array.isArray = Array.isArray || function(o) {
    return Object.prototype.toString.call(o) === "[object Array]";
};
function error(node, msg) {
    print(node.tokenizer.filename +":"+ String(node.lineno) +" error: "+ msg);
    quit(-1);
}

function createTraverseData() {
    var o = [];

    o[tkn.FUNCTION] = ["body"];
    o[tkn.IF] = ["condition", "thenPart", "elsePart"];
    o[tkn.SWITCH] = ["discriminant", "cases"];
    o[tkn.CASE] = ["caseLabel", "statements"];
    o[tkn.DEFAULT] = ["statements"];
    o[tkn.FOR] = ["setup", "condition", "update", "body"];
    o[tkn.WHILE] = ["condition", "body"];
    o[tkn.FOR_IN] = [/*"varDecl",*/ "iterator", "object", "body"];
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
// visit function signature: function(node, parent, parentProp)
function traverseTree(node, visitfns, parent, parentProp) {
    if (!node) {
        return node;
    }
    if (!(node instanceof Narcissus.parser.Node)) {
        throw new Error("traverseTree: expected Node, got "+ typeof node +
                       ". parentProp: "+ parentProp);
    }

    var old = node;
    visitfns.pre && (node = visitfns.pre(node, parent, parentProp) || node);
    if (node === "stop-traversal") {
        return old;
    }
    else if (!(node instanceof Narcissus.parser.Node)) {
        throw new Error("traverseTree: visitfns.post invalid return type");
    }

    var subprops = traverseData[node.type] || [];
    for (var i = 0; i < subprops.length; i++) {
        var prop = subprops[i];
        if (Array.isArray(node[prop])) {
            for (var j = 0, k = node[prop].length; j < k; j++) {
                traverseTree(node[prop][j], visitfns, node, prop +"["+ String(j) +"]");
            }
        }
        else {
            traverseTree(node[prop], visitfns, node, prop);
        }
    }

    visitfns.post && (node = visitfns.post(node, parent, parentProp) || node);
    if (!(node instanceof Narcissus.parser.Node)) {
        throw new Error("traverseTree: visitfns.post invalid return type");
    }

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
    var level = 0;
    traverseTree(root, {
        pre: function(node, parent, parentProp) {
            print(spaces(level * 2) + (parentProp || "root") +": "+
                  nodeString(node));
            ++level;
        },
        post: function(node, parent, parentProp) {
            --level;
        }
    });
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

function alterTree(root) {
    function replace(node, var_args) {
        var placeholders = [];
        //collect all $ nodes into placeholders array
        traverseTree(node, {pre: function(node, parent, parentProp) {
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
    function checkerPost(node, parent, parentProp) {
        if (node.type === tkn.SCRIPT) {
            useRestrictStack.pop();
        }
    }
    function checkerPre(node, parent, parentProp) {
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
            replaceNode = parseExpression(restrictfns[node.type]);
            if (node.children.length === 1) {
                replace(replaceNode, node.children[0]);
            }
            else {
                replace(replaceNode, node.children[0], node.children[1]);
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
                replaceNode = parseExpression("$ = "+ __op +"($, $)");
                replace(replaceNode, lvalue, lvalue, v);
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
        setParent(parent, parentProp, replaceNode);
        return replaceNode;
    }
    traverseTree(root, {pre: checkerPre, post: checkerPost});
}
function adjustStartEnd(root) {
    root.start = 0;
    root.end = root.tokenizer.source.length;

    return traverseTree(root, {post: function(node, parent, parentProp) {
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
    var tokenizer = {source: "", filename: root.tokenizer.filename};

    return traverseTree(root, {
        pre: function(node, parent, parentProp) {
            node.pos = node.start;
            node.srcs = [];

            if (parent) {
                if(parent.pos > node.start ||
                   node.start === undefined || node.end === undefined) {
                    throw new Error("srcsify: src already covered."+
                                    " parent: "+ nodeString(parent) +
                                    " parent."+ parentProp +": "+ nodeString(node));
                }
                var src = parent.tokenizer.source;
                var frag = src.slice(parent.pos, node.start);
                parent.srcs.push(frag);
                parent.pos = node.end;
            }
        },
        post: function(node, parent, parentProp) {
            var src = node.tokenizer.source;
            node.srcs.push(src.slice(node.pos, node.end));
            delete node.pos;
            delete node.start;
            delete node.end;
            node.tokenizer = tokenizer;
            //delete node.tokenizer;
        }
    });
}

function annotation(re, applyfn) {
    annotation.matchers.push({re: re, applyfn: applyfn});
}
annotation.matchers = [];

function annotate(root) {
    var annotations = [];
    function pushNodeFragment(node, frag) {
        // remove to-end-of-line comments (// comment)
        frag = frag.replace(/\/\/.*/g, "");

        // skip if frag doesn't contain anything but whitespace
        if (frag.search(/\S/) === -1) {
            return;
        }
        // apply annotations captured on previous node fragment to this node
        if (annotations.length > 0) {
            applyAnnotations(node);
            return;
        }

        var isTerminalNode = (node.srcs.length === 1);
        captureAnnotation(node, frag, isTerminalNode);

        // special-case for terminal node, for example where fragment is
        // (/*loose*/ x), (/*loose*/ (x)) or {/*loose*/}
        // in this case the annotations should be applied to the same node
        // for which it was captured, not next node
        if (annotations.length > 0 && isTerminalNode) {
            applyAnnotations(node);
        }
    }
    function captureAnnotation(node, frag, allowTrailing) {
        // hard-coded to /*loose*/ annotation for now, could be extended
        // to capture any registered annotation fragment

        // fragment includes /*loose*/? (optional extra '*' and ' ')
        for (var i = 0; i < annotation.matchers.length; i++) {
            var match = frag.match(annotation.matchers[i].re);
            if (match === null) {
                continue;
            }
            if (!allowTrailing) {
                var tail = frag.slice(match.index + match[0].length);
                // strip all /* inline */ comments [http://ostermiller.org/findcomment.html]
                tail = tail.replace(/\/\*([^*]|[\r\n]|(\*+([^*\/]|[\r\n])))*\*+\//g, "");

                // tail should only contain whitespace
                if (tail.search(/\S/) !== -1) {
                    error(node, "invalid annotation: "+ frag.slice(match.index));
                }
            }
            annotations.push({applyfn: annotation.matchers[i].applyfn, match: match});
        }
    }
    function applyAnnotations(node) {
        // todo annotations could be per-node, per-subtree or have a
        // custom, possibly tree-modifying, apply function
        // for now only per-node is implemented

        //print("applyAnnotations: "+ nodeString(node));
        for (var i = 0; i < annotations.length; i++) {
            var applyfn = annotations[i].applyfn;
            var match = annotations[i].match;
            applyfn(node, match);
        }
        annotations = [];
    }

    return traverseTree(root, {
        pre: function(node, parent, parentProp) {
            if (parent) {
                pushNodeFragment(parent, parent.srcs[parent.nPushed++]);
            }
            node.nPushed = 0;
        },
        post: function(node, parent, parentProp) {
            pushNodeFragment(node, node.srcs[node.nPushed++]);
            delete node.nPushed;
        }
    });
}

Narcissus.parser.Node.prototype.getSrc = function() {
    var srcs = [];
    traverseTree(this, {
        pre: function(node, parent, parentProp) {
            if (parent) {
                srcs.push(parent.srcs[parent.nPushed++]);
            }
            node.nPushed = 0;
        },
        post: function(node, parent, parentProp) {
            srcs.push(node.srcs[node.nPushed++]);
            delete node.nPushed;
        }
    });
    return srcs.join("");
};

function parse(str, filename) {
    return annotate(srcsify(adjustStartEnd(Narcissus.parser.parse(str, filename || "<no filename>", 1))));
}
function parseExpression(expr) {
    // SCRIPT -> [SEMICOLON ->] expr
    var stmnt = parse(expr).children[0];
    return stmnt.type === tkn.SEMICOLON ? stmnt.expression : stmnt;
}

annotation(/\/\*+\s*loose\s*\*+\//, function(node, match) {
    node.loose = true;
});

//print("checker.js done");
