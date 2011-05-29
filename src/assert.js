"use strict"; "use restrict";

var Assert = (function() {
    var printfn = (typeof console !== "undefined") && console.log || print;
    function assert(condition, var_args) {
        condition ? assert.pass(arguments) : assert.fail(arguments);
    }
    assert.pass = function(args) {
    };
    assert.fail = function(args) {
        var str = args.length === 1 ? String(args[0]) :
            Array.prototype.slice.call(args, 1).join(", ");

        throw new Error("Assertion failed: "+ str);
    };
    assert.throwsException = function(fn, var_args) {
        var res = false;
        try {
            fn();
        }
        catch (e) {
            res = true;
        }

        var args = Array.prototype.slice.call(arguments, 0);
        args.splice(1, 0, "should throw an exception");

        res ? assert.pass(args) : assert.fail(args);
    };

    return assert;
})();

if (typeof exports !== "undefined") {
    module.exports = Assert;
}
