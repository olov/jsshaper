var require = require || function(f) { load(f); };
var Shaper = Shaper || require("shaper.js") || Shaper;
var Log = Log || require("log.js") || Log;
var Assert = Assert || require("assert.js") || Assert;

function match(template, node, conds) {
    return Shaper.match(Shaper.parseExpression(template),
                        Shaper.parseExpression(node),
                        conds);
}

Assert(match("$", "1"));
Assert(match("$", "1 + x"));
Assert(match("x = [$]", "x = [1]"));
Assert(!match("x = [$]", "x = [1, 2]"));
Assert(match("x = [$$]", "x = [1, 2]"));
Assert(match("[1, 2, 3]", "[1, 2, 3]"));
Assert(!match("[1, 2]", "[1, 2, 3]"));
Assert(!match("[1, 2, 3]", "[1, 2]"));
Assert(match("[$, $$]", "[1, 2, [3]]"));
Assert(match("[$, $$]", "[1, 2, [3]]", {$: {}, $$: {rest: true}})); // default
Assert(match("[_, __]", "[1, 2, [3]]", {_: {}, __: {rest: true}})); // choose your wildcards
Assert(match("[1, $$]", "[1, 2, 3]"));
Assert(match("function f(a, b) { return $; }", "function f(a, b) { return 1; }"));
Assert(!match("function f(a, b) { return $; }", "function g(x) { return 1; }"));
Assert(match("if (true) { $ }", "if (true) { typeof 1; }"));
Assert(match("if (true) { $ }", "if (true) { debugger; }"));
Assert(match("function f(a, b) { $$ }", "function f(a, b) { return 1; }"));
Assert(match("$NUM", "1", {$NUM: function(n) { return n.type === tkn.NUMBER; }}));
Assert(match("$NUM", "1", {$NUM: {type: tkn.NUMBER}}));
Assert(match("$NUM", "1", {$NUM: {type: function(t) { return t === tkn.NUMBER; }}}));

Assert(match("[ONE_STR, REST_NUMBERS]", "['one', 2, 3]", {
    ONE_STR: {type: tkn.STRING},
    REST_NUMBERS: {rest: true, type: tkn.NUMBER}
}));

var conds = {
    ONE_STR: {type: tkn.STRING},
    REST_NUMBERS_OR_STRINGS: {rest: true, type: function(t) {
        return t === tkn.NUMBER || t === tkn.STRING;
    }}
};
Assert(match("[ONE_STR, REST_NUMBERS_OR_STRINGS]", "['one', 2, 3]", conds));
Assert(!match("[ONE_STR, REST_NUMBERS_OR_STRINGS]", "['one', 2, null]", conds));

Log("all tests passed");
