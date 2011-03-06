"use strict"; "use restrict";

var Fmt = (function() {
    function fmt(str, var_args) {
        var args = Array.prototype.slice.call(arguments, 1);
        return str.replace(/\{(\d+)\}/g, function(s, match) {
            return (match in args ? args[match] : s);
        });
    }
    /* // alternative version of fmt
    function fmt(str, var_args) {
        for (var i = 0; i < arguments.length - 1; i++) {
            var re = new RegExp("\\{"+ String(i) +"\\}", "g");
            str = str.replace(re, arguments[i + 1]);
        }
        return str;
    }*/
    function cat(var_args) {
        return String.prototype.concat.apply(String.prototype, arguments);
    }
    function abbrev(str, max) {
        max = Math.max(Number(max) || 3, 3);
        if (str.length <= max) {
            return str;
        }
        var l = Math.ceil((max - 3) / 2);
        var r = Math.floor((max - 3) / 2);
        return cat(str.slice(0, l), "...", str.slice(str.length - r, str.length));
    }
    function repeat(str, n) {
        return (new Array(n + 1)).join(str);
    }

    fmt.cat = cat;
    fmt.abbrev = abbrev;
    fmt.repeat = repeat;
    return fmt;
})();
