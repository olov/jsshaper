"use strict"; "use restrict";

var Fmt = Fmt || require("./fmt.js") || Fmt;

var Log = (function() {
    var printfn = (typeof console !== "undefined") && console.log || print;
    function log(var_args) {
        printfn(format(arguments));
    }
    function format(args) {
        return args.length === 0 ? "" :
            args.length === 1 ? String(args[0]) :
            Fmt.apply(Fmt, args);
    }
    function verb(filename, lineno, fnname, var_args) {
        var args = Array.prototype.slice.call(arguments, 3);
        printfn(Fmt("{0} line {1} <{2}>: {3}", filename, lineno, fnname, format(args)));
    }

    log.verb = verb;
    return log;
})();

if (typeof exports !== "undefined") {
    module.exports = Log;
}
