"use strict"; "use restrict";

var Assert = (function() {
    var printfn = (typeof console !== "undefined") && console.log || print;
    function assert(condition, var_args) {
        condition ? assert.pass(arguments) : assert.fail(arguments);
    }
    assert.pass = function(args) {
    };
    assert.fail = function(args) {
        var quitfn = typeof quit === "undefined" ? process.exit : quit;
        var str = args.length === 1 ? String(args[0]) :
            Array.prototype.slice.call(args, 1).join(", ");

        printfn("Assertion failed: "+ str);
        quitfn(-1);
    };

    return assert;
})();

if (typeof exports !== "undefined") {
    module.exports = Assert;
}
