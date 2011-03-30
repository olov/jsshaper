assert.log = (typeof console !== "undefined") && console.log || print;
assert.quit = (typeof quit === "undefined" ? process.exit : quit);
function assert(condition, str) {
    if (!condition) {
        assert.log("Assertion failed: "+ (str || String(condition)));
        assert.quit(-1);
    }
}

function f1(x) {
    assert(/*test if they are equal*/ x !== "qwerty");
}
var f2 = function(x) {
    assert(x === 0);
}
f1("qwerty");
f2(1);
assert(false);
