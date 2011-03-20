"use strict"; "use restrict";

/* global Narcissus, tkn */ require("./narcissus.js");
var Fmt = Fmt || require("./fmt.js") || Fmt;
var Ref = Ref || require("./ref.js") || Ref;
var Comments = Comments || require("./comments.js") || Comments;
var print = print || console.log;

var Shaper = (function() {
    Array.isArray = Array.isArray || function(o) {
        return Object.prototype.toString.call(o) === "[object Array]";
    };
    function error(node, msg) {
        print(Fmt("{0}:{1} error: {2}", node.tokenizer.filename, node.lineno, msg));
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
        // preconditions
        if (!node) {
            return node;
        }
        if (!(node instanceof Narcissus.parser.Node)) {
            throw new Error(Fmt("traverseTree: expected Node, got {0}. {1}",
                                typeof node, ref));
        }
        ref = ref || new Ref();

        // call pre callback, if any
        if (visitfns.pre) {
            var old = node;
            node = visitfns.pre(node, ref) || node;
            if (node === "break") {
                return old;
            }
            else if (!(node instanceof Narcissus.parser.Node)) {
                throw new Error("traverseTree: visitfns.post invalid return type");
            }
        }

        // traverse descendants
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

        // call post callback, if any
        if (visitfns.post) {
            node = visitfns.post(node, ref) || node;
            if (!(node instanceof Narcissus.parser.Node)) {
                throw new Error("traverseTree: visitfns.post invalid return type");
            }
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
    Narcissus.parser.Node.prototype.verboseString = Narcissus.parser.Node.prototype.toString;
    Narcissus.parser.Node.prototype.toString = function() {
        function tokenString(tt) {
            var defs = Narcissus.definitions;
            var t = defs.tokens[tt];
            return /^\W/.test(t) ? defs.opTypeNames[t] : t.toUpperCase();
        }
        function strPos(pos) {
            return pos === undefined ? "?" : String(pos);
        }
        var src = this.tokenizer.source;
        return tokenString(this.type) +
            ("srcs" in this ? JSON.stringify(this.srcs) :
             "start" in this && "end" in this ?
             Fmt(" '{0}'", JSON.stringify(Fmt.abbrev(src.slice(this.start, this.end), 30))) :
             (this.value !== undefined ? Fmt(" ({0})", this.value) : "")) +
            ("start" in this || "end" in this ?
             Fmt(" ({0}..{1})", strPos(this.start), strPos(this.end)) : "") +
            (this.parenthesized ? " parenthesized": "");
    };
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
    Narcissus.parser.Node.prototype.printTree = function() {
        var level = 0;
        traverseTree(this, {
            pre: function(node, ref) {
                print(Fmt("{0}{1}: <{2}>", Fmt.repeat(" ", level * 2), node, ref.prop[0] || "root"));
                ++level;
            },
            post: function(node, ref) {
                --level;
            }
        });
    };
    function printTree(root) {
        root.printTree();
    }
    function printSource(root) {
        print(root.getSrc());
    }

    //// parse and adjust
    function parseScript(str, filename) {
        return srcsify(adjustStartEnd(adjustComments(adjustStartEnd(Narcissus.parser.parse(str, filename || "<no filename>", 1)))));
    }
    function parseExpression(expr) {
        // SCRIPT -> [SEMICOLON ->] expr
        var stmnt = parseScript(expr).children[0];
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
    function adjustComments(root) {
        var comments = Comments.indexArray(root.tokenizer.source);

        // extend node.start to left to cover leading comment
        // before: /*c*/ x*y+z, after: /*c*/ x*y+z
        //               -----         -----------
        var i = 0;
        try {
            traverseTree(root, {pre: function(node, ref) {
                while (true) {
                    if (i === comments.length) {
                        throw true; // abort traversal
                    }
                    else if (comments[i].next > node.start) {
                        return undefined;
                    }
                    else if (comments[i].next === node.start) {
                        node.start = comments[i].start;
                        comments[i] = null;
                    }
                    ++i;
                }
            }});
        } catch (e) {}

        // extend node.end to right to cover trailing comment
        // before: x*y+z /*c*/, after: x*y+z /*c*/
        //         -----               -----------
        i = 0;
        try {
            traverseTree(root, {post: function(node, ref) {
                while (true) {
                    while (i < comments.length && comments[i] === null) {
                        ++i;
                    }
                    if (i === comments.length) {
                        throw true; // abort traversal
                    }
                    if (comments[i].prev > node.end) {
                        return undefined;
                    }
                    if (comments[i].prev === node.end) {
                        node.end = comments[i].end;
                        comments[i] = null;
                    }
                    ++i;
                }
            }});
        } catch (e) {}

        return root;
    }
    function srcsify(root) {
        var tokenizer = {source: "", filename: root.tokenizer.filename};

        return traverseTree(root, {
            pre: function(node, ref) {
                var parent = ref.base;
                node.pos = node.start;
                node.srcs = [];

                if (parent) {
                    if (parent.pos > node.start ||
                       node.start === undefined || node.end === undefined) {
                        throw new Error(Fmt("srcsify: src already covered. parent: {0} {1}:{2}",
                                            parent, ref, node));
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

    // register shapes and run pipeline
    var shapes = {};
    function shaper(name, fn) {
        shapes[name] = fn;
    }
    function get(name) {
        return shapes[name];
    }
    function run(root, pipeline) {
        for (var i = 0; i < pipeline.length; i++) {
            var shape = pipeline[i];
            if (typeof shape !== "function") {
                shape = shapes[shape];
            }
            root = shape(root) || root;
        }
        return root;
    }

    shaper("tree", printTree);
    shaper("print", printSource);

    Object.defineProperties(shaper, {
        traverseTree: {value: traverseTree},
        replace: {value: replace},
        parseScript: {value: parseScript},
        parseExpression: {value: parseExpression},
        get: {value: get},
        run: {value: run}
    });
    return shaper;
})();

if (typeof exports !== "undefined") {
    module.exports = Shaper;
}
