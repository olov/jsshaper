if (typeof define !== 'function') { var define = require('amdefine')(module); }

define(['./fmt'], function(Fmt) {
    "use strict"; "use restrict";

    var _console = (typeof console !== "undefined") && console || {log: print};
    function log(var_args) {
        _console.log(format(arguments));
    }
    function format(args) {
        return args.length === 0 ? "" :
            args.length === 1 ? String(args[0]) :
            Fmt.apply(Fmt, args);
    }
    function verb(filename, lineno, fnname, var_args) {
        var args = Array.prototype.slice.call(arguments, 3);
        _console.log(Fmt("{0} line {1} <{2}>: {3}", filename, lineno, fnname, format(args)));
    }

    log.verb = verb;
    return log;
});
