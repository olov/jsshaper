"use strict";

var require;
var nodejs = Boolean(require);
var log = nodejs ? console.log : print;
var load;
if (nodejs) {
    load = function (filename) {
        require('fs').readFile('./'+ filename, function(err, content) {
            if (err) throw err;
            eval(content.toString());
        });
    };
}
var __old_str_cat = function(arg0) {
    // TODO check Array.prototype.join("") performance
    if (arguments.length === 0) {
        return "";
    }
    if (arguments.length === 1) {
        if (typeof arg0 === "string") {
            return arg0;
        }
        return String(arg0);
    }

    var args = Array.prototype.slice.call(arguments, 1, arguments.length);
    return String.prototype.concat.apply(String(arg0), args);
};
String.concat = function() {
    return String.prototype.concat.apply(String.prototype, arguments);
};

function __throw_typeerror(from, x, y) {
    function detailedtypeof(v) {
        var t = typeof v;
        return t !== "object" ? t :
            v === null ? "null" :
            Array.isArray(v) ? "object (Array)" :
            v instanceof Number ? "object (Number)" :
            v instanceof String ? "object (String)" :
            v instanceof Boolean ? "object (Boolean)" :
            v instanceof Date ? "object (Date)" :
            "object";
    }
    throw new Error("restrict mode "+ from +" called with "+
                    detailedtypeof(x) +" and "+ detailedtypeof(y));
}

function __lt(l, r) {
    var ltype = typeof l;
    var rtype = typeof r;

    if (ltype === rtype) {
        if ((ltype === "string" || ltype === "number")) {
            return l /*loose*/ < r;
        }
    }
    __throw_typeerror("__lt", l, r);
}
function __uadd(v) {
    // TODO remove altogether and require explicit Number("101") str->num?
    var vtype = typeof v;
    // doesn't support boxed Number or String (yet?)
    if (vtype === "number" || vtype === "string") {
        return /*loose*/ +v;
    }
    throw new Error("restrict mode __uadd called with "+ vtype);
}
function __add(x, y) {
    var xtype = typeof x;
    var ytype = typeof y;
    if (xtype === ytype) {
        if (xtype === "string") {
            return String.prototype.concat.call(x, y);
        }
        if (xtype === "number") {
            return x /*loose*/ + y;
        }
    }

    __throw_typeerror("__add", x, y);
}
function __sub(l, r) { // binary sub, TODO unary sub
    var ltype = typeof l;
    var rtype = typeof r;
    if (ltype === "number" && ltype === rtype) {
        return l /*loose*/ - r;
    }
    __throw_typeerror("__sub", l, r);
}

function assertEquals(l, r) {
    if (l === r) {
        log("PASS " + l);
    }
    else {
        log("FAIL " + l + " !== " + r);
        throw new Error("assertion failed");
    }
}

function assertThrows(fn) {
    try {
        fn();
    }
    catch (e) {
        log("PASS " + e);
        return;
    }
    log("FAIL no exception thrown");
    throw new Error("assertion failed");
}

Array.isArray = Array.isArray || function(o) {
    return Object.prototype.toString.call(o) === '[object Array]';
};

var _str = String.concat;
assertEquals(_str(), "");
assertEquals(_str(""), "");
assertEquals(_str("one"), "one");
assertEquals(_str(1), "1");
assertEquals(_str("one", 2), "one2");
assertEquals(_str("one", 2, "three", 4), "one2three4");

assertEquals(__lt(1, 2), true);
assertEquals(__lt("abc", "bac"), true);
assertEquals(__lt("abc", "abc"), false);
assertThrows(function() { __lt([1,2,3], [2,3,4]); });
assertThrows(function() { __lt([10], [2]); } );
assertThrows(function() { __lt([[2]], [["1"]]); } );
assertThrows(function() { __lt(new Number(1), 2); });
assertEquals(__uadd(1), 1);
assertEquals(__uadd("1"), 1);
assertEquals(__uadd("1.1"), 1.1);
assertEquals(isNaN(__uadd("asdf")), true);
assertEquals(__uadd(""), 0);
assertThrows(function() { __uadd(null); });
assertThrows(function() { __uadd(undefined); });
assertThrows(function() { __uadd([]); });
assertThrows(function() { __uadd({}); });
assertEquals(__sub(1,2), -1);
assertThrows(function() { __sub("1", 0); });

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
        // parseFloat can't be used since it's to permissive ("3x" -> 3)
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
    if (preferredType === "hint_string") {
        val = v.toString();
        if (__isPrimitive(val)) {
            return val;
        }
        val = v.valueOf();
        if (__isPrimitive(val)) {
            return val;
        }
        throw new TypeError("Cannot convert object to primitive value");
    }
    else if (preferredType === "hint_number") {
        // TODO check for valueOf existence?
        val = v.valueOf();
        if (__isPrimitive(val)) {
            return val;
        }
        val = v.toString();
        if (__isPrimitive(val)) {
            return val;
        }
        throw new TypeError("Cannot convert object to primitive value");
    }
    else {
        throw new Error("__defaultValue invalid preferredType");
    }
}
function __loose_eq(x, y) {
    // ecma 11.9.3
    var xtype = typeof x;
    var ytype = typeof y;

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
        return __loose_eq(x, __toNumber(y));
    }
    // ecma 11.9.3 17
    if (xtype === "string" && ytype === "number") {
        return __loose_eq(__toNumber(x), y);
    }
    // ecma 11.9.3 18
    if (xtype === "boolean") {
        return __loose_eq(__toNumber(x), y);
    }
    // ecma 11.9.3 19
    if (ytype === "boolean") {
        return __loose_eq(x, __toNumber(y));
    }
    // ecma 11.9.3 20
    if ((xtype === "string" || xtype === "number") && ytype === "object") {
        return __loose_eq(x, __toPrimitive(y));
    }
    // ecma 11.9.3 21
    if (xtype === "object" && (ytype === "string" || ytype === "number")) {
        return __loose_eq(__toPrimitive(x), y);
    }
    // ecma 11.9.3 22
    return false;
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
    return __toNumber(x) + __toNumber(y);
}
function __loose_sub(x, y) { // ecma 11.6.2
    // re-use built-in - operator for number subtraction
    return __toNumber(x) - __toNumber(y);
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
        if (op === 0) return x < y;
        if (op === 1) return x <= y;
        if (op === 2) return x > y;
        if (op === 3) return x >= y;
    }
    // ecma 4-15
    else {
        // re-use built-in operators for IEEE-754 floating point comparision
        if (op === 0) return __toNumber(x) < __toNumber(y);
        if (op === 1) return __toNumber(x) <= __toNumber(y);
        if (op === 2) return __toNumber(x) > __toNumber(y);
        if (op === 3) return __toNumber(x) >= __toNumber(y);
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
// allow a++ ++a a-- --a as single statements only (like Google Go)?
function __loose_prefinc(v) { // ecma 11.4.4
    // special handling for dereferencing via []
    // to avoid double side-effects, for example a[f()]++
    // todo what about g()[f()]++ where g returns an array?
    //   or slightly simpler g().x++ where g returns an object
    // see ecma 11.2 left-hand-side expressions
    //   property accessors (., [])
    //   new operator
    //   function calls
    //   argument lists
    //   function expressions
}

assertEquals(__loose_eq(1, "1"), true);
assertEquals(__loose_eq(2, new String("2")), true);
assertEquals(__loose_eq(2, {valueOf: function() { return 2; }}), true);
assertEquals(__loose_eq(2, new Number(2)), true);
assertEquals(__loose_lt(2, new Number(3)), true);
assertEquals(__loose_le(2, new Number(3)), true);
assertEquals(__loose_gt(2, new Number(3)), false);
assertEquals(__loose_gt(2, new String("3")), false);
assertEquals(typeof __toNumber(f), "number"); // NaN
assertEquals(__toNumber(f).toString(), "NaN"); // NaN
assertEquals(typeof __toPrimitive(f), "string"); // "function f..."
assertEquals(typeof __toString(f), "string"); // "function f..."
assertEquals(typeof __defaultValue(f), "string"); // "function f..."

// test postfinc rewrite
var a = [0,2,4];
function f() { log("f side-effect"); return 1; }
assertEquals(a[f()]++, 2);
assertEquals(a[1], 3);
a = [0,2,4];
var tmp1, tmp2;
assertEquals((tmp2 = a[tmp1=f()], a[tmp1] = __loose_add(a[tmp1], 1), tmp2), 2);
assertEquals(a[1], 3);

// test += rewrite (prefinc ++a follows since ++a <=> a += 1

// property index expression
a = [0,2,4];
assertEquals(a[f()] += 1, 3);
assertEquals(a[1], 3);
a = [0,2,4];
tmp1 = undefined, tmp2 = undefined;
assertEquals(a[tmp1=f()] = __loose_add(a[tmp1], 1), 3);
assertEquals(a[1], 3);

// array/object expression
var o = {x: 1};
function ofn() { return o; };
assertEquals(ofn().x++, 1);
assertEquals(o.x, 2);
o = {x: 1};
tmp1 = undefined, tmp2 = undefined;
assertEquals((tmp2 = (tmp1 = ofn()).x, tmp1.x = __loose_add(tmp1.x, 1), tmp2), 1);
assertEquals(o.x, 2);

// combination of the two TODO
