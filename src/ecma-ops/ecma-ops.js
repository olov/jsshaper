"use strict"; "use restrict";

var require = require || function(f) { load(f); };
var Fmt = Fmt || require("fmt.js") || Fmt;
var log = (typeof console !== "undefined") && console.log || print;
var Assert = Assert || require("assert.js") || Assert;

// we want to load restrict-prelude into the global namespace
var restrict_mode = "plugins/restricter/restrict-mode.js";
if (typeof process !== "undefined") { // node
    eval(require("fs").readFileSync(restrict_mode).toString());
}
else { // js, jsc or v8/d8
    load(restrict_mode);
}

function __toBoolean(v) {
    //short version:
    //return v !== undefined && v !== null && v !== false &&
    //    v !== 0 && isNaN(v) === false && v !== "";

    // ecma 9.2
    var vtype = typeof v;
    if (v === undefined) {
        return false;
    }
    if (v === null) {
        return false;
    }
    if (vtype === "boolean") {
        return v;
    }
    if (vtype === "number") {
        return v !== 0 && isNaN(v) === false;
    }
    if (vtype === "string") {
        return v === "";
    }
    return true;
}
function __toNumber(v) {
    // ecma 9.3
    var vtype = typeof v;
    if (v === undefined) {
        return NaN;
    }
    if (v === null) {
        return 0;
    }
    if (vtype === "boolean") {
        return v ? 1 : 0;
    }
    if (vtype === "number") {
        return v;
    }
    if (vtype === "string") {
        // parseFloat can't be used since it's too permissive ("3x" -> 3)
        // re-use built-in
        return Number(v);
    }
    // object, function or host object
    return __toNumber(__toPrimitive(v, "hint_number"));
}
function __toString(v) {
    // ecma 9.8
    var vtype = typeof v;
    if (v === undefined) {
        return "undefined";
    }
    if (v === null) {
        return "null";
    }
    if (vtype === "boolean") {
        return v ? "true" : "false";
    }
    if (vtype === "number") {
        // re-use built-in
        return String(v);
    }
    if (vtype === "string") {
        return v;
    }
    // object, function or host object
    return __toString(__toPrimitive(v, "hint_string"));
}
function __isPrimitive(v) {
    var vtype = typeof v;
    // false if object, function or host object (with custom typeof)
    return (v === undefined || v === null || vtype === "boolean" ||
            vtype === "number" || vtype === "string");
}
function __toPrimitive(v, preferredType) {
    // ecma 9.1
    return __isPrimitive(v) ? v : __defaultValue(v, preferredType);
}
function __defaultValue(v, preferredType) {
    // ecma 8.6.2.6
    if (preferredType === undefined) {
        var isDate = Object.prototype.toString.call(v) === "[object Date]";
        preferredType = (isDate ? "hint_string" : "hint_number");
    }
    var val;
    // checks for toString and valueOf function existence before calling
    // for ecma compliance (host objects?)
    if (preferredType === "hint_string") {
        if (typeof v.toString === "function") {
            val = v.toString();
            if (__isPrimitive(val)) {
                return val;
            }
        }
        if (typeof v.valueOf === "function") {
            val = v.valueOf();
            if (__isPrimitive(val)) {
                return val;
            }
        }
        throw new TypeError("Cannot convert object to primitive value");
    }
    else if (preferredType === "hint_number") {
        if (typeof v.valueOf === "function") {
            val = v.valueOf();
            if (__isPrimitive(val)) {
                return val;
            }
        }
        if (typeof v.toString === "function") {
            val = v.toString();
            if (__isPrimitive(val)) {
                return val;
            }
        }
        throw new TypeError("Cannot convert object to primitive value");
    }
    else {
        throw new Error("__defaultValue invalid preferredType");
    }
}

function __type(x) {
    if (x === null) {
        return "null";
    }
    var xtype = typeof x;
    return xtype === "function" ? "object" : xtype;
}

function __loose_eq_ecma(x, y) {
    // ecma 11.9.3
    var xtype = __type(x);
    var ytype = __type(y);

    // ecma 11.9.3 1-13
    if (x === y) { // ecma 11.9.4
        return true;
    }

    // ecma 11.9.3 14-15
    if (x === null || x === undefined) {
        return y === null || y === undefined;
    }
    // ecma 11.9.3 16
    if (xtype === "number" && ytype === "string") {
        return __loose_eq_ecma(x, __toNumber(y));
    }
    // ecma 11.9.3 17
    if (xtype === "string" && ytype === "number") {
        return __loose_eq_ecma(__toNumber(x), y);
    }
    // ecma 11.9.3 18
    if (xtype === "boolean") {
        return __loose_eq_ecma(__toNumber(x), y);
    }
    // ecma 11.9.3 19
    if (ytype === "boolean") {
        return __loose_eq_ecma(x, __toNumber(y));
    }
    // ecma 11.9.3 20
    if ((xtype === "string" || xtype === "number") && ytype === "object") {
        return __loose_eq_ecma(x, __toPrimitive(y));
    }
    // ecma 11.9.3 21
    if (xtype === "object" && (ytype === "string" || ytype === "number")) {
        return __loose_eq_ecma(__toPrimitive(x), y);
    }
    // ecma 11.9.3 22
    return false;
}
function __loose_eq(x, y) {
    // ecma 11.9.3
    var xtype = __type(x);
    var ytype = __type(y);

    // if x and y are of the same type, use strict comparision
    if (xtype === ytype) {
        return x === y; // ecma 11.9.4
    }

    // here, x and y are of different type

    // handle null/undefined
    if (x === null || x === undefined) {
        return y === null || y === undefined;
    }
    if (y === null || y === undefined) {
        return false;
    }

    // here, x and y can be of type object, bool, number, string
    // here, x and y are of different type

    // if object, convert to primitive
    if (xtype === "object") {
        x = __toPrimitive(x), xtype = __type(x);
    }
    else if (ytype === "object") {
        y = __toPrimitive(y), ytype = __type(y);
    }

    // here, x and y can be of type undefined, null, bool, number, string
    // here, x and y may be of the same or different type

    // if both x and y are strings, compare lexically
    if (xtype === "string" && ytype === "string") {
        return x === y;
    }

    // here, x and y can be of type undefined, null, bool, number, string
    // here, x and y may be of the same or different type

    // convert x and y to numbers and compare
    return __toNumber(x) === __toNumber(y);
}
function __loose_ne(x, y) { // ecma 11.9.2
    return !__loose_eq(x, y);
}
function __loose_add(x, y) { // ecma 11.6.1
    // ecma 1-6
    x = __toPrimitive(x); // no type hint
    y = __toPrimitive(y); // no type hint
    var xtype = typeof x;
    var ytype = typeof y;

    // ecma 7, 12-15
    if (xtype === "string" || ytype === "string") {
        return String.prototype.concat.call(__toString(x), __toString(y));
    }
    // ecma 8-11
    // re-use built-in + operator for number addition
    return /*@loose*/(__toNumber(x) + __toNumber(y));
}
function __loose_sub(x, y) { // ecma 11.6.2
    // re-use built-in - operator for number subtraction
    return /*@loose*/(__toNumber(x) - __toNumber(y));
}
function __loose_internal_compare(x, y, op) { // ecma 11.8.1
    // ecma 11.8.5
    // ecma 1-2
    x = __toPrimitive(x, "hint_number");
    y = __toPrimitive(y, "hint_number");
    var xtype = typeof x;
    var ytype = typeof y;

    // ecma 3, 16-21
    if (xtype === "string" && ytype === "string") {
        // re-use built-in operators for lexical string comparision
        if (op === 0) return /*@loose*/(x < y);
        if (op === 1) return /*@loose*/(x <= y);
        if (op === 2) return /*@loose*/(x > y);
        if (op === 3) return /*@loose*/(x >= y);
    }
    // ecma 4-15
    else {
        // re-use built-in operators for IEEE-754 floating point comparision
        if (op === 0) return /*@loose*/(__toNumber(x) < __toNumber(y));
        if (op === 1) return /*@loose*/(__toNumber(x) <= __toNumber(y));
        if (op === 2) return /*@loose*/(__toNumber(x) > __toNumber(y));
        if (op === 3) return /*@loose*/(__toNumber(x) >= __toNumber(y));
    }
    throw new Error("__loose_internal_compare invalid op");
}
function __loose_lt(x, y) { // ecma 11.8.1
    return __loose_internal_compare(x, y, 0);
}
function __loose_le(x, y) { // ecma 11.8.3
    return __loose_internal_compare(x, y, 1);
}
// __loose_gt can't be !__loose_le because
// NaN < Nan, NaN <= NaN and NaN > NaN are all false
function __loose_gt(x, y) { // ecma 11.8.2
    return __loose_internal_compare(x, y, 2);
}
function __loose_ge(x, y) { // ecma 11.8.4
    return __loose_internal_compare(x, y, 3);
}


function test_loose() {
    function f() {}
    Assert(__loose_eq(1, "1"));
    Assert(__loose_eq(2, new String("2")));
    Assert(__loose_eq(2, {valueOf: function() { return 2; }}));
    Assert(__loose_eq(2, new Number(2)));
    Assert(__loose_lt(2, new Number(3)));
    Assert(__loose_le(2, new Number(3)));
    Assert(__loose_gt(2, new Number(3)) === false);
    Assert(__loose_gt(2, new String("3")) === false);
    Assert(typeof __toNumber(f) === "number"); // NaN
    Assert(__toNumber(f).toString() === "NaN"); // NaN
    Assert(typeof __toPrimitive(f) === "string"); // "function f..."
    Assert(typeof __toString(f) === "string"); // "function f..."
    Assert(typeof __defaultValue(f) === "string"); // "function f..."

    Assert(__lt(1, 2));
    Assert(__lt("abc", "bac"));
    Assert(__lt("abc", "abc") === false);
    Assert.throwsException(function() { __lt([1,2,3], [2,3,4]); });
    Assert.throwsException(function() { __lt([10], [2]); } );
    Assert.throwsException(function() { __lt([[2]], [["1"]]); } );
    Assert.throwsException(function() { __lt(new Number(1), 2); });
    Assert(__sub(1,2) === -1);
    Assert.throwsException(function() { __sub("1", 0); });
}
test_loose();

function test_binary_operator() {
    function create_getter(o, key, val) {
        o[key] = function() { return val; };
        return o;
    }
    var values = {
        "undefined": [undefined],
        "boolean": [true, false],
        "Boolean": [new Boolean(true), new Boolean(false)],
        "number": [0, 0.1, 0.5, 1, 1.1, 1.5, 2, 3, 8, 10, 11, 20, 100,
                   /*0,*/ 316998000000, 1282600800000, // Dates
                   Number.MAX_VALUE, Number.MIN_VALUE,
                   Infinity, NaN],
        "Number": [],
        "string": ["", " ", "  ",
                   "undefined", "true", "false",
                   "a", "b", "xy", "zw", "qwerty"],
        "String": [],
        "Date": [new Date(0), new Date(1980, 1-1, 18), new Date(2010, 8-1, 24)],
        "object": [null, {}, {key: "value"}],
        "array": [[], [1], [2], [10], [1, 2], [1, 3], [[]], [[1]], [[1], 2]],
        "function": [function() {}, function() { return 1; },
                     new Function(), new Function("return 1;")]
    };

    var i, len;
    // populate string with string representation of
    // Date, object, array, function values
    for (i = 0, len = values["Date"].length; i < len; ++i) {
        values["string"].push(String(values["Date"][i]));
    }
    for (i = 0, len = values["object"].length; i < len; ++i) {
        values["string"].push(String(values["object"][i]));
    }
    for (i = 0, len = values["array"].length; i < len; ++i) {
        values["string"].push(String(values["array"][i]));
    }
    for (i = 0, len = values["function"].length; i < len; ++i) {
        values["string"].push(String(values["function"][i]));
    }
    // populate string with string representation of numbers
    for (i = 0, len = values["number"].length; i < len; ++i) {
        var str = String(values["number"][i]);
        values["string"].push(str, "-"+ str, // positive, negative
                              " "+ str, str +",", // prep space, app comma
                              "0"+ str); // prep "0" (octalness)
    }

    // populate number with negative values
    for (i = 0, len = values["number"].length; i < len; ++i) {
        values["number"].push(-values["number"][i]);
    }

    // populate Number with boxed numbers
    for (i = 0, len = values["number"].length; i < len; ++i) {
        values["Number"].push(new Number(values["number"][i]));
    }

    // populate String with boxed strings
    for (i = 0, len = values["string"].length; i < len; ++i) {
        values["String"].push(new String(values["string"][i]));
    }

    //flatten
    var flat = [];
    flat = flat.concat(values["undefined"],
                       values["boolean"],// values["Boolean"],
                       values["number"],// values["Number"],
                       values["string"],// values["String"],
                       values["Date"], values["object"],
                       values["array"], values["function"]);

    function create_valueOf_toString(type, ctor) {
        for (i = 0, len = flat.length; i < len; ++i) {
            values[type].push(
                create_getter(new ctor, "valueOf", flat[i]));
            values[type].push(
                create_getter(new ctor, "toString", flat[i]));
            values[type].push(
                create_getter(create_getter(new ctor, "valueOf", flat[i])),
                "toString", flat[i], flat[len-i-1]);
        }
    }

    /*
    create_valueOf_toString("object", Object);
    create_valueOf_toString("function", Function);
    create_valueOf_toString("Boolean", Boolean);
    create_valueOf_toString("Number", Number);
    create_valueOf_toString("String", String);
    create_valueOf_toString("Date", Date);
    create_valueOf_toString("array", Array);
*/
    flat = [];
    for (var type in values) {
        log(Fmt("{0}: {1} values", type, values[type].length));
        flat = flat.concat(values[type]);
    }
    log(Fmt("Total {0} values", flat.length));

    var j;
    for (i = 0; i < flat.length; i++) {
        for (j = 0; j < flat.length; j++) {
            var exc_a = false, exc_b = false;
            var val_a, val_b;
            try { val_a = /*@loose*/(flat[i] == flat[j]); }
            catch (e) { exc_a = e; }

            try { val_b = __loose_eq(flat[i], flat[j]); }
            catch (e) { exc_b = e; }

            if (exc_a || exc_b) {
                Assert(!!exc_a === !!exc_b);
            }
            else {
                if (val_a !== val_b && !(isNaN(val_a) && isNaN(val_b))) {
//                    log(i,j); continue;

                    log(Fmt(
                        "flat[{0}] == flat[{1}] yields {2} but __loose_eq(flat[{0}], flat[{1}]) yields {3}",
                        i, j, val_a, val_b));
                    inspect(flat[i]);
                    inspect(flat[j]);
                    log();
//                    Assert(false);
                }
            }
        }
    }
}
test_binary_operator();

function test_jsvm_differences(vmstr) {
    var vm = {js: vmstr === "js", v8: vmstr === "v8",
              jsc: vmstr === "jsc", ecma: vmstr === "ecma"};

    // js, v8, jsc yield true, ecma (my interpretation) yields false
    Assert(/*@loose*/(false == {valueOf: function() { return null; }}) === !vm.ecma);

    Assert(/*@loose*/("" == {valueOf: function() { return null; }}) === vm.js);

    Assert(/*@loose*/(false == new Date(0)) === !vm.js);
    Assert(/*@loose*/(0 == new Date(0)) === !vm.js);
    Assert(/*@loose*/(316998000000 == new Date(1980, 1-1, 18)) === !vm.js);
    Assert(/*@loose*/(1282600800000 == new Date(2010, 8-1, 24)) === !vm.js);
}
//test_jsvm_differences("v8");

function inspect(v) {
    var str = "inspect("+ __verbosetypeof(v) +")";
    var val;
    if (v.valueOf) {
        val = v.valueOf();
        str += Fmt(" valueOf: {0} ({1})", val, __verbosetypeof(val));
    }
    if (v.toString) {
        val = v.toString();
        str += Fmt(" toString: {0} ({1})", val, __verbosetypeof(val));
    }
    log(str);
}

Array.isArray = Array.isArray || function(o) {
    return Object.prototype.toString.call(o) === "[object Array]";
};

log("ecma-ops.js done");
