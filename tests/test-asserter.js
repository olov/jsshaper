var require = require || function(f) { load(f); };
var Assert = Assert || require("./assert.js") || Assert;

function f1(x) {
    Assert(/*test if they are equal*/ x !== "qwerty");
}
var f2 = function(x) {
    Assert(x === 0, "x can't be zero");
};
f1("qwerty");
f2(1);
Assert(false);
