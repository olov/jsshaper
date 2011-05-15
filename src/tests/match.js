var require = require || function(f) { load(f); };
var Shaper = Shaper || require("shaper.js") || Shaper;
var Log = Log || require("log.js") || Log;
var Assert = Assert || require("assert.js") || Assert;

function match(template, node) {
    return Shaper.match(Shaper.parseExpression(template),
                        Shaper.parseExpression(node),
                        false);
}

Assert(match("$", "1"));
Assert(match("$", "1 + x"));
Assert(match("x = [$]", "x = [1]"));
Assert(!match("x = [$]", "x = [1, 2]"));
Assert(match("x = [$$]", "x = [1, 2]"));
Assert(match("function f(a, b) { return $; }", "function f(a, b) { return 1; }"));
// todo fix, below should fail but doesn't (traverseData FUNCTION)
Assert(match("function f(a, b) { return $; }", "function g(x) { return 1; }"));
Assert(match("if (true) { $ }", "if (true) { debugger; }"));
Assert(match("if (true) { $ }", "if (true) { typeof 1; }"));
Assert(match("function f(a, b) { $$ }", "function f(a, b) { return 1; }"));
Log("all tests passed");
