"use strict"; "use restrict";

var require = require || function(f) { load(f); };
/* global Narcissus, tkn */ (typeof Narcissus === "undefined") && require("./narcissus.js");
var Fmt = Fmt || require("./fmt.js") || Fmt;
var Ref = Ref || require("./ref.js") || Ref;
var Log = Log || require("./log.js") || Log;
var Assert = Assert || require("./assert.js") || Assert;
var Comments = Comments || require("./comments.js") || Comments;
var log = (typeof console !== "undefined") && console.log || print;

var Shaper = (function() {
    Array.isArray = Array.isArray || function(o) {
        return Object.prototype.toString.call(o) === "[object Array]";
    };
    function error(node, msg) {
        log(Fmt("{0}:{1} error: {2}", node.tokenizer.filename, node.lineno, msg));
        (typeof quit === "undefined" ? process.exit : quit)(-1);
    }

    var traverseData = (function() {
        var o = [];

        o[tkn.ARRAY_COMP] = [/*expr*/"expression", /*COMP_TAIL*/"tail"];
        o[tkn.CASE] = [/*expr*/"caseLabel", /*BLOCK*/"statements"];
        o[tkn.CATCH] = [/*expr*/"guard", /*BLOCK*/"block"];
        o[tkn.COMP_TAIL] = [/*[FOR_IN]*/"children", /*expr*/"guard"]; // has children but not last
        o[tkn.DEFAULT] = [/*BLOCK*/"statements"];
        o[tkn.DO] = [/*stmt*/"body", /*expr*/"condition"];
        o[tkn.FOR] = [/*expr*/"setup", /*expr*/"condition", /*expr*/"update", /*stmt*/"body"];
        o[tkn.FOR_IN] = [/*todo "varDecl",*/ /*IDENTIFIER*/"iterator", /*expr*/"object", /*stmt*/"body"];
        o[tkn.FUNCTION] = [/*SCRIPT*/"body"];
        o[tkn.GENERATOR] = [/*expr*/"expression", /*COMP_TAIL*/"tail"];
        o[tkn.GETTER] = [/*SCRIPT*/"body"];
        o[tkn.IDENTIFIER] = [/*expr*/"initializer"];
        o[tkn.IF] = [/*expr*/"condition", /*stmt*/"thenPart", /*stmt*/"elsePart"];
        o[tkn.LABEL] = [/*stmt*/"statement"];
        o[tkn.LET_BLOCK] = [/*LET*/"variables", /*expr*/"expression", /*BLOCK*/"block"];
        o[tkn.RETURN] = [/*expr*/"value"];
        o[tkn.SEMICOLON] = [/*expr*/"expression"];
        o[tkn.SETTER] = [/*SCRIPT*/"body"];
        o[tkn.SWITCH] = [/*expr*/"discriminant", /*[CASE|DEFAULT]*/"cases"];
        o[tkn.THROW] = [/*expr*/"exception"];
        o[tkn.TRY] = [/*BLOCK*/"tryBlock", /*[CATCH]*/"catchClauses", /*BLOCK*/"finallyBlock"];
        o[tkn.WHILE] = [/*expr*/"condition", /*stmt*/"body"];
        o[tkn.WITH] = [/*expr*/"object", /*stmt*/"body"];
        o[tkn.YIELD] = [/*expr*/"value"];

/*
        // TODO these properties aren't nodes but still relevant
        x[tkn.ASSIGN] = ["assignOp"]; // number ("value" has string representation)
        x[tkn.INCREMENT] = ["postfix"]; // boolean ("value" is just "++")
        x[tkn.DECREMENT] = ["postfix"]; // boolean
        x[tkn.FUNCTION] = ["functionForm", "name", "params"]; // number, string, array of strings
        x[tkn.FOR_IN] = ["isEach"]; // boolean
        x[tkn.SWITCH] = ["defaultIndex"]; // number
        x[tkn.CATCH] = ["varName"]; // string
        x[tkn.LABEL] = ["label"]; // string
        x[tkn.IDENTIFIER] = ["value"]; // string, same as "name" when part of VAR 
        x[tkn.NUMBER] = ["value"]; // number (can differ from srcs)
        x[tkn.REGEXP] = ["value"]; // string
        x[tkn.STRING] = ["value"]; // string (can differ from srcs)
        x[tkn.GETTER] = ["functionForm", "name", "params"]; // same as FUNCTION
        x[tkn.SETTER] = ["functionForm", "name", "params"]; // same as FUNCTION
*/

        var c = [
            /*[stmt]*/
            tkn.SCRIPT, tkn.BLOCK,

            /*[expr]*/
            tkn.COMMA,

            /*expr*/
            tkn.GROUP,

            /*[expr]*/
            tkn.ARRAY_INIT,

            /*[PROPERTY_INIT]*/
            tkn.OBJECT_INIT,

            /*IDENTIFIER, expr*/
            tkn.PROPERTY_INIT,

            /*[IDENTIFIER]*/
            tkn.LET, tkn.VAR, tkn.CONST,

            /*expr*/
            tkn.NEW,

            /*expr, LIST*/
            tkn.NEW_WITH_ARGS,

            /*expr, LIST*/
            tkn.CALL,

            /*[expr]*/
            tkn.LIST,

            /*expr, expr, expr (ternary operator)*/
            tkn.HOOK,

            /*expr, expr (binary operator)*/
            tkn.PLUS, tkn.MINUS, tkn.MUL, tkn.DIV, tkn.MOD,
            tkn.LSH, tkn.RSH, tkn.URSH,
            tkn.OR, tkn.AND,
            tkn.BITWISE_OR, tkn.BITWISE_XOR, tkn.BITWISE_AND,
            tkn.EQ, tkn.NE, tkn.STRICT_EQ, tkn.STRICT_NE,
            tkn.LT, tkn.LE, tkn.GE, tkn.GT,
            tkn.IN, tkn.INSTANCEOF,
            tkn.INDEX,

            /*IDENTIFIER|DOT|INDEX, expr (binary operator)*/
            tkn.ASSIGN,

            /*expr, IDENTIFIER (binary operator)*/
            tkn.DOT,

            /*IDENTIFIER|DOT|INDEX (unary operator)*/
            tkn.INCREMENT, tkn.DECREMENT,

            /*expr (unary operator)*/
            tkn.UNARY_PLUS, tkn.UNARY_MINUS,
            tkn.NOT, tkn.BITWISE_NOT,
            tkn.DELETE, tkn.VOID, tkn.TYPEOF
        ];

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

    var MISMATCH = 0;
    var MATCH = 1;
    var MATCH_REMAINING = 2;
    function match(t, n, verbose) {
        if (t && t.type === tkn.SEMICOLON && t.srcs[1] === "" &&
            t.expression && t.expression.type === tkn.IDENTIFIER &&
            (t.expression.value === "$" || t.expression.value === "$$")) {
            return match(t.expression, n, verbose);
        }
        if (t && t.type === tkn.IDENTIFIER) {
            if (t.value === "$") {
                // ok (template is $ so matches anything)
                // todo should $ match null/undefined?
                verbose && Log("match {0} {1}", t, n);
                return MATCH;
            }
            else if (t.value === "$$") {
                // ok (template is $$ so matches any remaining children)
                // todo should $$ match null/undefined?
                verbose && Log("match_remaining {0} {1}", t, n);
                return MATCH_REMAINING;
            }
        }
        if (!t || !n) {
            verbose && Log("{2} {0} {1}", t, n, !t === !n ? "match" : "mismatch");
            return !t === !n ? MATCH : MISMATCH;
        }
        if (t.type !== n.type) {
            // fail (type mismatch)
            verbose && Log("mismatch {0} {1}", t, n);
            return MISMATCH;
        }
        if (t.type === tkn.IDENTIFIER ||
            t.type === tkn.NUMBER ||
            t.type === tkn.REGEXP ||
            t.type === tkn.STRING) {
            if (t.value === n.value ||
                (t.type === tkn.NUMBER && isNaN(t.value) && isNaN(n.value))) {
                // ok (terminals with matching values)
                verbose && Log("match {0} {1}", t, n);
                return MATCH;
            }
            else {
                // fail (terminals with different values)
                verbose && Log("mismatch {0} {1}", t, n);
                return MISMATCH;
            }
        }

        // traverse descendants
        var subprops = traverseData[t.type] || [];
        var res;
        for (var i = 0; i < subprops.length; i++) {
            var prop = subprops[i];
            if (Array.isArray(t[prop])) {
                for (var j = 0, k = t[prop].length; j < k; j++) {
                    res = match(t[prop][j], n[prop][j], verbose);
                    if (res === MISMATCH) {
                        verbose && Log("mismatch {0} {1}", t[prop][j], n[prop][j]);
                        return MISMATCH;
                    }
                    else if (res === MATCH_REMAINING) {
                        verbose && Log("match_remaining {0} {1}", t[prop][j], n[prop][j]);
                        j = n[prop].length;
                        break;
                    }
                }
                if (j !== n[prop].length) {
                    verbose && Log("mismatch {0} {1}", t, n);
                    return MISMATCH;
                }
            }
            else {
                res = match(t[prop], n[prop], verbose);
                if (res === MISMATCH) {
                    verbose && Log("mismatch {0} {1}", t[prop], n[prop]);
                    return MISMATCH;
                }
                else if (res === MATCH_REMAINING) {
                    // todo verify ok
                    verbose && Log("match_remaining {0} {1}", t[prop], n[prop]);
                    break;
                }
            }
        }
        verbose && Log("match {0} {1}", t, n);
        return MATCH;
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
    function renameIdentifier(node, name) {
        Assert(node.type === tkn.IDENTIFIER);
        var oldValue = node.value;
        node.value = name;

        var comments = Comments.split(node.srcs[0]);
        for (var i = 0 ; i < comments.length; i++) {
            if (Comments.isComment(comments[i])) {
                continue;
            }
            comments[i] = comments[i].replace(oldValue, node.value);
        }
        node.srcs[0] = comments.join("");
    }
    function insertArgument(call, arg, pos) {
        Assert(call.type === tkn.CALL);
        var list = call.children[1];
        var srcs = list.srcs;
        var args = list.children;
        if (pos === -1) {
            pos = args.length;
        }
        Assert(pos >= 0 && pos <= args.length);

        // no arguments thus srcs is in style "(/*comments, whitespace*/ )"
        if (args.length === 0) {
            var parens = srcs.pop();
            var split = parens.lastIndexOf(")");
            srcs.push(parens.slice(0, split), parens.slice(split));
            args.push(arg);
        }
        else {
            srcs.splice(pos === args.length ? pos : pos + 1, 0, ", ");
            args.splice(pos, 0, arg);
        }
    }


    //// printers
    var Node = Narcissus.parser.Node;
    Node.prototype.verboseString = (function(oldToString) {
        return function(recursiveVerbose) {
            var res;
            if (recursiveVerbose === true) {
                var newToString = Node.prototype.toString;
                Node.prototype.toString = oldToString;
                res = this.toString();
                Node.prototype.toString = newToString;
            }
            else {
                res = oldToString.call(this);
            }
            return res;
        };
    })(Node.prototype.toString);
    Node.prototype.toString = function() {
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
             Fmt(" ({0}..{1})", strPos(this.start), strPos(this.end)) : "");
    };
    Node.prototype.getSrc = function() {
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
    Node.prototype.printTree = function() {
        var level = 0;
        traverseTree(this, {
            pre: function(node, ref) {
                log(Fmt("{0}{1}: <{2}>", Fmt.repeat(" ", level * 2), node, ref.prop[0] || "root"));
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
        log(root.getSrc());
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
        var comments = Comments.indexArray(root.tokenizer.source, root.tokenizer.comments);

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
        //             -                   -------
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
        var tokenizer = {
            source: "",
            filename: root.tokenizer.filename,
            comments: root.tokenizer.comments
        };

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
    shaper("source", printSource);

    shaper.error = error;
    shaper.traverseTree = traverseTree;
    shaper.match = match;
    shaper.replace = replace;
    shaper.renameIdentifier = renameIdentifier;
    shaper.insertArgument = insertArgument;
    shaper.parseScript = parseScript;
    shaper.parseExpression = parseExpression;
    shaper.get = get;
    shaper.run = run;
    return shaper;
})();

if (typeof exports !== "undefined") {
    module.exports = Shaper;
}
