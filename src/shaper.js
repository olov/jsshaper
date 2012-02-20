"use strict"; "use restrict";

var require = require || function(f) { load(f); };
require.paths && typeof __dirname !== "undefined" && require.paths.unshift(__dirname);
/* global Narcissus, tkn */ (typeof Narcissus === "undefined") && require("narcissus.js");
var Fmt = Fmt || require("fmt.js") || Fmt;
var Ref = Ref || require("ref.js") || Ref;
var Log = Log || require("log.js") || Log;
var Assert = Assert || require("assert.js") || Assert;
var Comments = Comments || require("comments.js") || Comments;
var log = (typeof console !== "undefined") && console.log || print;

var Shaper = (function() {
    Array.isArray = Array.isArray || function(o) {
        return Object.prototype.toString.call(o) === "[object Array]";
    };
    function error(node, msg) {
        log(Fmt("{0}:{1} error: {2}", node.tokenizer.filename, node.lineno, msg));
        (typeof quit === "undefined" ? process.exit : quit)(-1);
    }
    function deprecated(obj, params) {
        obj[params.was] = function() {
            throw new Error(Fmt.obj((params.now ?
                                     "{was} is deprecated since version {since}, use {now} instead" :
                                     "{was} is deprecated since version {since}"), params));
        };
    }

    var traverseData = (function() {
        var o = [];

        o[tkn.ARRAY_COMP] = [/*expr*/"expression", /*COMP_TAIL*/"tail"];
        o[tkn.CASE] = [/*expr*/"caseLabel", /*BLOCK*/"statements"];
        o[tkn.CATCH] = [/*IDENTIFIER*/"_name", /*expr*/"guard", /*BLOCK*/"block"];
        o[tkn.COMP_TAIL] = [/*[FOR_IN]*/"children", /*expr*/"guard"]; // has children but not last
        o[tkn.DEFAULT] = [/*BLOCK*/"statements"];
        o[tkn.DO] = [/*stmt*/"body", /*expr*/"condition"];
        o[tkn.FOR] = [/*expr*/"setup", /*expr*/"condition", /*expr*/"update", /*stmt*/"body"];
        o[tkn.FOR_IN] = [/*IDENTIFIER|VAR*/"_iterator", /*expr*/"object", /*stmt*/"body"];
        o[tkn.FUNCTION] = [/*IDENTIFIER*/"_name", /*[IDENTIFIER]*/"_params", /*SCRIPT*/"body"];
        o[tkn.GENERATOR] = [/*expr*/"expression", /*COMP_TAIL*/"tail"];
        o[tkn.GETTER] = [/*SCRIPT*/"body"];
        o[tkn.IF] = [/*expr*/"condition", /*stmt*/"thenPart", /*stmt*/"elsePart"];
        o[tkn.LABEL] = [/*IDENTIFIER*/"_label", /*stmt*/"statement"];
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

            /*[ASSIGN|IDENTIFIER]*/
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

    var extraTraverseData = (function() {
        var x = {};
        // These properties aren't nodes but may still be relevant
        x[tkn.ASSIGN] = ["assignOp"]; // number ("value" has string representation)
        x[tkn.INCREMENT] = ["postfix"]; // boolean ("value" is just "++")
        x[tkn.DECREMENT] = ["postfix"]; // boolean
        x[tkn.FUNCTION] = ["functionForm"]; // number
        x[tkn.FOR_IN] = ["isEach"]; // boolean
        x[tkn.SWITCH] = ["defaultIndex"]; // number
        x[tkn.IDENTIFIER] = ["value"]; // string, same as "name" when part of VAR
        x[tkn.NUMBER] = ["value"]; // number (can differ from srcs)
        x[tkn.REGEXP] = ["value"]; // string
        x[tkn.STRING] = ["value"]; // string (can differ from srcs)
        return x;
    })();

    //// generic traverse
    // visitfns: {pre: function, post: function}
    // visit function signature: function(node, ref)
    function traverse(node, visitfns, ref) {
        // preconditions
        if (!node) {
            return node;
        }
        if (!(node instanceof Narcissus.parser.Node)) {
            throw new Error(Fmt("traverse: expected Node, got {0}. {1}",
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
                throw new Error("traverse: visitfns.post invalid return type");
            }
        }

        // traverse descendants
        var subprops = traverseData[node.type] || [];
        for (var i = 0; i < subprops.length; i++) {
            var prop = subprops[i];
            if (Array.isArray(node[prop])) {
                for (var j = 0; j < node[prop].length; j++) {
                    traverse(node[prop][j], visitfns, new Ref(node, prop, j));
                }
            }
            else {
                traverse(node[prop], visitfns, new Ref(node, prop));
            }
        }

        // call post callback, if any
        if (visitfns.post) {
            node = visitfns.post(node, ref) || node;
            if (!(node instanceof Narcissus.parser.Node)) {
                throw new Error("traverse: visitfns.post invalid return type");
            }
        }

        return node;
    }

    var MISMATCH = 0;
    var MATCH = 1;
    var MATCH_REST = 2;
    function matchCondition(node, cond) {
        // TODO cond.capture invokes callback or stores in array?

        // cond is a function
        if (typeof cond === "function") {
            return cond(node) ? cond : false;
        }
        // cond is an object
        if (typeof cond !== "object") {
            throw new Error("matchCondition: expected function or object, got "+ typeof cond);
        }
        for (var key in cond) {
            var condVal = cond[key];
            // special
            if (key === "rest" && condVal) {
                continue;
            }
            var nodeVal = node[key];
            //  cond.key is a function
            if (typeof condVal === "function") {
                if (!condVal(nodeVal)) {
                    return false;
                }
            }
            // cond.key is a value
            else if (!(condVal === nodeVal || isNaN(condVal) && isNaN(nodeVal))) {
                return false;
            }
        }
        return cond;
    }

    match.debug = false;
    function match(t, n, conds) {
        var i;
        if (typeof t === "string") {
            t = Shaper.parse(t);
        }
        if (typeof n === "string") {
            throw new Error("match: expected second argument of type Node, got string");
        }
        conds = conds || {$: {}, $$: {rest: true}};

        if (t && t.type === tkn.IDENTIFIER) {
            var cond = conds[t.value];
            // todo should conds match null/undefined?
            if (cond !== undefined) {
                if (matchCondition(n, cond)) {
                    return cond.rest ? MATCH_REST : MATCH;
                }
            }
        }
        if (!t || !n) {
            match.debug && Log("{2} {0} {1}", t, n, !t === !n ? "match" : "mismatch");
            return !t === !n ? MATCH : MISMATCH;
        }
        if (t.type !== n.type) {
            // fail (type mismatch)
            match.debug && Log("mismatch {0} {1}", t, n);
            return MISMATCH;
        }
        if (t.type === tkn.IDENTIFIER ||
            t.type === tkn.NUMBER ||
            t.type === tkn.REGEXP ||
            t.type === tkn.STRING) {
            if (t.value === n.value ||
                (t.type === tkn.NUMBER && isNaN(t.value) && isNaN(n.value))) {
                // ok (terminals with matching values)
                match.debug && Log("match {0} {1}", t, n);
                return MATCH;
            }
            else {
                // fail (terminals with different values)
                match.debug && Log("mismatch {0} {1}", t, n);
                return MISMATCH;
            }
        }
        var extraprops = extraTraverseData[t.type] || [];
        for (i = 0; i < extraprops.length; i++) {
            var extra = extraprops[i];
            if (extra === 'value') {
                // handled above.
                continue;
            }
            if (t[extra] !== n[extra]) {
                match.debug && Log("mismatch {0} {1} {2}",
                                   extra, t[extra], n[extra]);
                return MISMATCH;
            }
        }

        // traverse descendants
        var subprops = traverseData[t.type] || [];
        var res;
        for (i = 0; i < subprops.length; i++) {
            var prop = subprops[i];
            // t[prop] is an array, such as BLOCK.children
            if (Array.isArray(t[prop])) {
                var rest = null; // bound to MATCH_REST node, if any

                for (var j = 0, k = Math.max(t[prop].length, n[prop].length);
                     j < k; j++) {
                    var tt = rest || t[prop][j];
                    var nn = n[prop][j];
                    if (!tt || !nn) { // nodes or template starved (both can't be)
                        match.debug && Log("mismatch {0} {1}", tt, nn);
                        return MISMATCH;
                    }

                    res = match(tt, nn, conds);
                    if (res === MISMATCH) {
                        match.debug && Log("mismatch {0} {1}", tt, nn);
                        return MISMATCH;
                    }
                    else if (res === MATCH_REST) {
                        rest = tt;
                        match.debug && Log("match_rest {0} {1}", tt, nn);
                    }
                }
            }
            // t[prop] is a regular node, such as IF.thenPart
            else {
                res = match(t[prop], n[prop], conds);
                if (res === MISMATCH) {
                    match.debug && Log("mismatch {0} {1}", t[prop], n[prop]);
                    return MISMATCH;
                }
                // MATCH or MATCH_REST matches this node
            }
        }
        match.debug && Log("match {0} {1}", t, n);
        return MATCH;
    }

    //// mutate nodes
    function replace(node, var_args) {
        if (typeof node === "string") {
            node = Shaper.parse(node);
        }

        var placeholders = [];
        //collect all $ nodes into placeholders array
        traverse(node, {pre: function(node, ref) {
            if (node.type === tkn.IDENTIFIER && node.value === "$") {
                placeholders.push(ref);
            }
        }});
        var args = arguments.length === 2 && Array.isArray(var_args) ?
            var_args :
            Array.prototype.slice.call(arguments, 1);
        if (args.length !== placeholders.length) {
            throw new Error("replace: placeholders.length mismatch");
        }

        // replace placeholders with new nodes
        for (var i = 0; i < placeholders.length; i++) {
            placeholders[i].set(args[i]);
        }

        return node;
    }
    function renameIdentifier(node, name) {
        Assert(node.type === tkn.IDENTIFIER);
        node.value = node.srcs[0] = name;
    }
    function remove(ref) {
        Assert(ref.properties.length === 2);
        var node = ref.base;
        var prop = ref.properties[0];
        var index = Number(ref.properties[1]);
        var len = node[prop].length;
        Assert(index >= 0 && index < len);

        if (len === 1) {
            node.srcs[0] += node.srcs.pop();
        }
        else {
            node.srcs.splice(index === len - 1 ? index : index + 1, 1);
        }
        node[prop].splice(index, 1);
    }
    function insertBefore(ref, node, delimiter) {
        Assert(ref.properties.length === 2);
        _insert(ref.base, node, ref.properties[0], Number(ref.properties[1]), delimiter);
    }
    function insertAfter(ref, node, delimiter) {
        Assert(ref.properties.length === 2);
        _insert(ref.base, node, ref.properties[0], Number(ref.properties[1]) + 1, delimiter);
    }
    function _insert(node, child, prop, pos, delimiter) {
        var srcs = node.srcs;
        var children = node[prop];
        if (pos === -1) {
            pos = children.length;
        }
        Assert(pos >= 0 && pos <= children.length);

        // no children thus srcs could be in style "(/*comments, whitespace*/ )"
        // -> srcs: ["(/*comments, whitespace*/ ", ")"]
        if (children.length === 0) {
            var parens = srcs.pop();
            var last = parens.length - 1;
            srcs.push(parens.slice(0, last), parens.slice(last));
            children.push(child);
        }
        // has children already, insert new delimiter in srcs
        else {
            // create default delimiter if possible
            if (delimiter === undefined) {
                // get indentation from first node in SCRIPT, minus { character if any
                if (node.type === tkn.SCRIPT || node.type === tkn.BLOCK) {
                    delimiter = (srcs[0][0] === "{" ? srcs[0].slice(1) : srcs[0]);
                }
                else if (node.type === tkn.LIST) {
                    delimiter = ", ";
                }
                else {
                    throw new Error("_insert: Can't create default delimiter for node "+ node.toString(false));
                }
            }

            // temporary hardcoded workaround for semicolon issues
            // `{ var x; }` BLOCK has no SEMICOLON, block.srcs is { @; }
            var splicePos = (pos === children.length ? pos : pos + 1);
            if (splicePos === children.length && (node.type === tkn.SCRIPT || node.type === tkn.BLOCK)) {
                if (srcs[children.length][0] === ";") {
                    srcs[children.length] = srcs[children.length].slice(1);
                    delimiter = ";"+ delimiter;
                }
            }
            srcs.splice(splicePos, 0, delimiter);
            children.splice(pos, 0, child);
        }
    }
    function cloneComments(dst, src) {
        if (src.leadingComment !== undefined) {
            dst.leadingComment = src.leadingComment;
        }
        if (src.trailingComment !== undefined) {
            dst.trailingComment = src.trailingComment;
        }
    }


    //// printers
    var Node = Narcissus.parser.Node;
    Node.prototype.verboseString = (function(oldToString) {
        return function(recurse) {
            if (recurse === undefined) {
                recurse = true;
            }
            var res;
            var newToString = Node.prototype.toString;
            if (recurse === true) {
                Node.prototype.toString = oldToString;
                res = this.toString();
            }
            else {
                Node.prototype.toString = function() {
                    return newToString.call(this, false);
                };
                res = oldToString.call(this);
            }
            Node.prototype.toString = newToString;
            return res;
        };
    })(Node.prototype.toString);
    Node.prototype.tknString = function() {
        var tt = this.type;
        var defs = Narcissus.definitions;
        var t = defs.tokens[tt];
        return /^\W/.test(t) ? defs.opTypeNames[t] : t.toUpperCase();
    };
    Node.prototype.toString = function(recurse) {
        if (recurse === undefined) {
            recurse = true;
        }
        return recurse ? treeString(this) : nodeString(this);
    };
    function nodeString(node) {
        function strPos(pos) {
            return pos === undefined ? "?" : String(pos);
        }
        var src = node.tokenizer.source;

        return node.tknString() +": "+
            ("srcs" in node ? Fmt.abbrev(JSON.stringify(node.srcs.join("@")).slice(1,-1), 60) :
             "start" in node && "end" in node ?
             Fmt(" '{0}'", JSON.stringify(Fmt.abbrev(src.slice(node.start, node.end), 30))) :
             (node.value !== undefined ? Fmt(" ({0})", node.value) : "")) +
            ("start" in node || "end" in node ?
             Fmt(" ({0}..{1})", strPos(node.start), strPos(node.end)) : "");
    };
    function treeString(node) {
        var level = 0;
        var lines = [];
        traverse(node, {
            pre: function(node, ref) {
                var comments = [];
                if (node.leadingComment) {
                    comments.push("leadingComment: "+ (Fmt.abbrev(node.leadingComment, 20) || ""));
                }
                if (node.trailingComment) {
                    comments.push("trailingComment: "+ (Fmt.abbrev(node.trailingComment, 20) || ""));
                }
                comments = comments.join(", ");

                lines.push(Fmt("{0}{1}  < {2}{3}",
                               Fmt.repeat(" ", level * 2),
                               nodeString(node),
                               ref.base ? ref.toString(ref.base.tknString()) : "root",
                               comments ? "  "+ JSON.stringify(comments).slice(1, -1) : ""));
                ++level;
            },
            post: function(node, ref) {
                --level;
            }
        });
        return lines.join("\n");
    }
    Node.prototype.getSrc = function() {
        var srcs = [];
        traverse(this, {
            pre: function(node, ref) {
                var parent = ref.base;
                if (parent) {
                    srcs.push(parent.srcs[parent.nPushed++]);
                }
                node.nPushed = 0;
                if (node.leadingComment !== undefined) {
                    srcs.push(node.leadingComment);
                }
            },
            post: function(node, ref) {
                srcs.push(node.srcs[node.nPushed++]);
                if (node.trailingComment !== undefined) {
                    srcs.push(node.trailingComment);
                }
                delete node.nPushed;
            }
        });
        return srcs.join("");
    };


    //// parse and adjust
    function parseScript(str, filename) {
        return srcsify(adjustStartEnd(adjustComments(adjustStartEnd(Narcissus.parser.parse(str, filename || "<no filename>", 1)))));
    }
    function parse(str) {
        var script = parseScript(str);

        // only one statement/expression so skip SCRIPT node
        if (script.children.length === 1) {
            return script.children[0];
        }

        // SCRIPT contains multiple statements/expressions so return as-is
        return script;
    }
    function adjustStartEnd(root) {
        root.start = 0;
        root.end = root.tokenizer.source.length;

        return traverse(root, {post: function(node, ref) {
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
            traverse(root, {pre: function(node, ref) {
                while (true) {
                    if (i === comments.length) {
                        throw true; // abort traversal
                    }
                    else if (comments[i].next > node.start) {
                        return undefined;
                    }
                    else if (comments[i].next === node.start) {
                        node.origStart = node.start;
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
            traverse(root, {post: function(node, ref) {
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
                        node.origEnd = node.end;
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

        return traverse(root, {
            pre: function(node, ref) {
                var parent = ref.base;
                node.pos = node.start;
                node.srcs = [];

                var src;
                if (parent) {
                    if (parent.pos > node.start ||
                       node.start === undefined || node.end === undefined) {
                        throw new Error(Fmt("srcsify: src already covered. parent: {0} {1}:{2}",
                                            parent, ref, node.toString(false)));
                    }
                    src = parent.tokenizer.source;
                    var frag = src.slice(parent.pos, node.start);
                    parent.srcs.push(frag);
                    parent.pos = node.end;
                }
                if (node.origStart !== undefined) { // has leadingComment
                    src = node.tokenizer.source;
                    node.leadingComment = src.slice(node.pos, node.origStart);
                    node.pos = node.origStart;
                }
            },
            post: function(node, ref) {
                var src = node.tokenizer.source;
                if (node.origEnd !== undefined) { // has trailingComment
                    node.srcs.push(src.slice(node.pos, node.origEnd));
                    node.trailingComment = src.slice(node.origEnd, node.end);
                }
                else {
                    node.srcs.push(src.slice(node.pos, node.end));
                }
                delete node.pos;
                delete node.start;
                delete node.end;
                delete node.origStart;
                delete node.origEnd;
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

    shaper("tree", function(root) {
        log(root.toString());
    });
    shaper("source", function(root) {
        log(root.getSrc());
    });
    shaper("version", function(root) {
        log(Fmt("Shaper for JavaScript version {0}", shaper.version));
    });

    shaper.error = error;
    shaper.traverse = traverse;
    shaper.match = match;
    shaper.replace = replace;
    shaper.renameIdentifier = renameIdentifier;
    shaper.remove = remove;
    shaper.insertBefore = insertBefore;
    shaper.insertAfter = insertAfter;
    shaper.cloneComments = cloneComments;
    shaper.parseScript = parseScript;
    shaper.parse = parse;
    shaper.get = get;
    shaper.run = run;

    deprecated(shaper, {since: "0.1", was: "parseExpression", now: "parse"});
    deprecated(shaper, {since: "0.1", was: "insertArgument", now: "insertBefore or insertAfter"});
    deprecated(shaper, {since: "0.1", was: "traverseTree", now: "traverse"});
    deprecated(Node.prototype, {since: "0.1", was: "printTree", now: "toString"});

    shaper.version = "0.1-pre";

    return shaper;
})();

if (typeof exports !== "undefined") {
    module.exports = Shaper;
}
