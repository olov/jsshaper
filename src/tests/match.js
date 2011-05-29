var require = require || function(f) { load(f); };
var Shaper = Shaper || require("shaper.js") || Shaper;
var Log = Log || require("log.js") || Log;
var Assert = Assert || require("assert.js") || Assert;

Assert (Shaper.match("$", Shaper.parse("1")));
Assert (Shaper.match("$", Shaper.parse("1 + x")));
Assert (Shaper.match("x = [$]", Shaper.parse("x = [1]")));
Assert (!Shaper.match("x = [$]", Shaper.parse("x = [1, 2]")));
Assert (Shaper.match("x = [$$]", Shaper.parse("x = [1, 2]")));
Assert (Shaper.match("[1, 2, 3]", Shaper.parse("[1, 2, 3]")));
Assert (!Shaper.match("[1, 2]", Shaper.parse("[1, 2, 3]")));
Assert (!Shaper.match("[1, 2, 3]", Shaper.parse("[1, 2]")));
Assert (Shaper.match("[$, $$]", Shaper.parse("[1, 2, [3]]")));
Assert (Shaper.match("[$, $$]", Shaper.parse("[1, 2, [3]]"), {$: {}, $$: {rest: true}})); // default
Assert (Shaper.match("[_, __]", Shaper.parse("[1, 2, [3]]"), {_: {}, __: {rest: true}})); // choose your wildcards
Assert (Shaper.match("[1, $$]", Shaper.parse("[1, 2, 3]")));
Assert (Shaper.match("function f(a, b) { return $; }", Shaper.parse("function f(a, b) { return 1; }")));
Assert (!Shaper.match("function f(a, b) { return $; }", Shaper.parse("function g(x) { return 1; }")));
Assert (Shaper.match("if (true) { $ }", Shaper.parse("if (true) { typeof 1; }")));
Assert (Shaper.match("if (true) { $ }", Shaper.parse("if (true) { debugger; }")));
Assert (Shaper.match("function f(a, b) { $$ }", Shaper.parse("function f(a, b) { return 1; }")));
Assert (Shaper.match("$NUM", Shaper.parse("1"), {$NUM: function(n) { return n.type === tkn.NUMBER; }}));
Assert (Shaper.match("$NUM", Shaper.parse("1"), {$NUM: {type: tkn.NUMBER}}));
Assert (Shaper.match("$NUM", Shaper.parse("1"), {$NUM: {type: function(t) { return t === tkn.NUMBER; }}}));

Assert (Shaper.match("[ONE_STR, REST_NUMBERS]", Shaper.parse("['one', 2, 3]"), {
    ONE_STR: {type: tkn.STRING},
    REST_NUMBERS: {rest: true, type: tkn.NUMBER}
}));

var conds = {
    ONE_STR: {type: tkn.STRING},
    REST_NUMBERS_OR_STRINGS: {rest: true, type: function(t) {
        return t === tkn.NUMBER || t === tkn.STRING;
    }}
};
Assert (Shaper.match("[ONE_STR, REST_NUMBERS_OR_STRINGS]", Shaper.parse("['one', 2, 3]"), conds));
Assert (!Shaper.match("[ONE_STR, REST_NUMBERS_OR_STRINGS]", Shaper.parse("['one', 2, null]"), conds));

Log("all tests passed");
