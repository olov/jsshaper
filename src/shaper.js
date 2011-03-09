"use strict"; "use restrict";

load("jsecma5.js");
var Narcissus;
load("narcissus/lib/jsdefs.js");
load("narcissus/lib/jslex.js");
load("narcissus/lib/jsparse.js");
load("fmt.js");
load("ref.js");

var tkn = Narcissus.definitions.tokenIds;
var Shaper = (function() {
    Array.isArray = Array.isArray || function(o) {
        return Object.prototype.toString.call(o) === "[object Array]";
    };
    function error(node, msg) {
        print(node.tokenizer.filename +":"+ String(node.lineno) +" error: "+ msg);
        quit(-1);
    }

    var traverseData = (function() {
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
    })();

    //// generic traverse
    // visitfns: {pre: function, post: function}
    // visit function signature: function(node, ref)
    function traverseTree(node, visitfns, ref) {
        if (!node) {
            return node;
        }
        if (!(node instanceof Narcissus.parser.Node)) {
            throw new Error("traverseTree: expected Node, got "+ typeof node +
                            ". "+ String(ref));
        }
        ref = ref || new Ref();

        var old = node;
        visitfns.pre && (node = visitfns.pre(node, ref) || node);
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
                    traverseTree(node[prop][j], visitfns, new Ref(node, prop, j));
                }
            }
            else {
                traverseTree(node[prop], visitfns, new Ref(node, prop));
            }
        }

        visitfns.post && (node = visitfns.post(node, ref) || node);
        if (!(node instanceof Narcissus.parser.Node)) {
            throw new Error("traverseTree: visitfns.post invalid return type");
        }

        return node;
    }

    //// mutate nodes
    function replace(node, var_args) {
        var placeholders = [];
        //collect all $ nodes into placeholders array
        traverseTree(node, {pre: function(node, ref) {
            if (node.type === tkn.IDENTIFIER && node.value === "$") {
                placeholders.push(ref);
            }
        }});
        if (arguments.length - 1 !== placeholders.length) {
            throw new Error("replace: placeholders.length mismatch");
        }

        // replace placeholders with new nodes
        for (var i = 0; i < placeholders.length; i++) {
            placeholders[i].set(arguments[i + 1]);
        }
    }

    //// printers
    function nodeString(node) {
        function tokenString(tt) {
            var defs = Narcissus.definitions;
            var t = defs.tokens[tt];
            return /^\W/.test(t) ? defs.opTypeNames[t] : t.toUpperCase();
        }
        function strPos(pos) {
            return pos === undefined ? "?" : String(pos);
        }
        var src = node.tokenizer.source;
        return tokenString(node.type) +
            ("srcs" in node ? " ["+ String(node.srcs) +"]" :
             "start" in node && "end" in node ?
             " '"+ Fmt.abbrev(src.slice(node.start, node.end), 30) +"'" :
             (node.value !== undefined ? " ("+ node.value +")" : "")) +
            ("start" in node || "end" in node ?
             " ("+ strPos(node.start) +".."+ strPos(node.end) +")" : "") +
            ("parenthesized" in node ? " parenthesized": "");
    }
    function printTree(root) {
        var level = 0;
        traverseTree(root, {
            pre: function(node, ref) {
                print(Fmt.repeat(" ", level * 2) + (ref || "root") +": "+
                      nodeString(node));
                ++level;
            },
            post: function(node, ref) {
                --level;
            }
        });
    }
    function printSource(root) {
        print(root.getSrc());
    }
    Narcissus.parser.Node.prototype.getSrc = function() {
        var srcs = [];
        traverseTree(this, {
            pre: function(node, ref) {
                var parent = ref.base;
                if (parent) {
                    srcs.push(parent.srcs[parent.nPushed++]);
                }
                node.nPushed = 0;
            },
            post: function(node, ref) {
                srcs.push(node.srcs[node.nPushed++]);
                delete node.nPushed;
            }
        });
        return srcs.join("");
    };

    //// parse and adjust
    function parse(str, filename) {
        return srcsify(adjustStartEnd(Narcissus.parser.parse(str, filename || "<no filename>", 1)));
    }
    function parseExpression(expr) {
        // SCRIPT -> [SEMICOLON ->] expr
        var stmnt = parse(expr).children[0];
        return stmnt.type === tkn.SEMICOLON ? stmnt.expression : stmnt;
    }
    function adjustStartEnd(root) {
        root.start = 0;
        root.end = root.tokenizer.source.length;

        return traverseTree(root, {post: function(node, ref) {
            var parent = ref.base;
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
            pre: function(node, ref) {
                var parent = ref.base;
                node.pos = node.start;
                node.srcs = [];

                if (parent) {
                    if(parent.pos > node.start ||
                       node.start === undefined || node.end === undefined) {
                        throw new Error("srcsify: src already covered."+
                                        " parent: "+ nodeString(parent) +
                                        " "+ String(ref) +": "+ nodeString(node));
                    }
                    var src = parent.tokenizer.source;
                    var frag = src.slice(parent.pos, node.start);
                    parent.srcs.push(frag);
                    parent.pos = node.end;
                }
            },
            post: function(node, ref) {
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

    // collect shapes and run
    var passes = [];
    function shape(fn) {
        passes.push(fn);
    }
    function run(root) {
        for (var i = 0; i < passes.length; i++) {
            var fn = passes[i];
            root = fn(root) || root;
        }
        passes = [];
        return root;
    }

    return {
        traverseTree: traverseTree,
        printTree: printTree,
        printSource: printSource,
        replace: replace,
        parse: parse,
        parseExpression: parseExpression,
        shape: shape,
        run: run
    };
})();
var traverseTree = Shaper.traverseTree;
var printTree = Shaper.printTree;
var printSource = Shaper.printSource;
var replace = Shaper.replace;
var parse = Shaper.parse;
var parseExpression = Shaper.parseExpression;
var shape = Shaper.shape;
