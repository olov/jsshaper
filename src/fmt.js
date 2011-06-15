"use strict"; "use restrict";

var Fmt = (function() {
    // String formatting
    // Call Fmt directly instead of Fmt.fmt
    // example: Fmt("Name: {0}, Age: {1}", "shaper", 0)
    //          Fmt("Name: {0}", {toString: function() { return "shaper"; }})
    function fmt(str, var_args) {
        var args = Array.prototype.slice.call(arguments, 1);
        return str.replace(/\{(\d+)\}/g, function(s, match) {
            return (match in args ? args[match] : s);
        });
    }
    // String formatting
    // example: Fmt.obj("Name: {name}, Age: {age}", {name: "shaper", age: 0})
    //          Fmt.obj("Name: {0}, Age: {1}", ["shaper", 0])
    function obj(str, obj) {
        return str.replace(/\{([_$a-zA-Z0-9][_$a-zA-Z0-9]*)\}/g, function(s, match) {
            return (match in obj ? obj[match] : s);
        });
    }
    // concat multiple strings
    function cat(var_args) {
        return String.prototype.concat.apply(String.prototype, arguments);
    }
    // abbreviate string into max characters
    function abbrev(str, max) {
        max = Math.max(Number(max) || 0, 0);
        if (str.length <= max) {
            return str;
        }
        if (max < 3) {
            return "...".slice(3 - max);
        }
        var l = Math.ceil((max - 3) / 2);
        var r = Math.floor((max - 3) / 2);
        return cat(str.slice(0, l), "...", str.slice(str.length - r, str.length));
    }
    // repeat string n times
    function repeat(str, n) {
        return (new Array(n + 1)).join(str);
    }

    // inspect object properties
    function inspect(obj, name) {
        name = name || "object";
        if (obj === null || obj === undefined) {
            return Fmt("{0} ({1})", name, obj);
        }

        var props = "";
        for (var prop in obj) {
            props += Fmt("\n    {0}: {1}", prop, obj[prop]);
        }
        return Fmt("{0} {{1}\n}", name, props);
    }

    fmt.fmt = fmt;
    fmt.obj = obj;
    fmt.cat = cat;
    fmt.abbrev = abbrev;
    fmt.repeat = repeat;
    fmt.inspect = inspect;
    return fmt;
})();

if (typeof exports !== "undefined") {
    module.exports = Fmt;
}
