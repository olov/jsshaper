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
String.concat = function() {
    return String.prototype.concat.apply(String.prototype, arguments);
};

function __throw_typeerror(from /* ... */) {
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
    var args = Array.prototype.slice.call(arguments, 1, arguments.length);
    throw new Error("restrict mode "+ from +" called with "+
                    args.map(detailedtypeof).join(" and "));
}

function __eq(x, y) { throw new Error("use === instead of __eq"); }
function __ne(x, y) { throw new Error("use !== instead of __ne"); }
function __lt(x, y) {
    var xtype = typeof x;
    var ytype = typeof y;

    if (xtype === ytype) {
        if ((xtype === "string" || xtype === "number")) {
            return x /*loose*/ < y;
        }
    }
    __throw_typeerror("__lt", x, y);
}
function __gt(x, y) { throw new Error("not implemented yet"); } // like __lt
function __le(x, y) { throw new Error("not implemented yet"); } // like __lt
function __ge(x, y) { throw new Error("not implemented yet"); } // like __lt

function __neg(v) {
    var vtype = typeof v;
    if (vtype === "number") {
        return /*loose*/ -v;
    }
    __throw_typeerror("__neg", v);
}

function __inc(v) {
    var vtype = typeof v;
    if (vtype === "number") {
        return v /*loose*/ + 1;
    }
    __throw_typeerror("__inc", v);
}
function __dec(v) {
    var vtype = typeof v;
    if (vtype === "number") {
        return v /*loose*/ - 1;
    }
    __throw_typeerror("__dec", v);
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
function __assert_numbers(x, y, opname) {
    var xtype = typeof x;
    var ytype = typeof y;
    if (xtype === "number" && xtype === ytype) {
        return; // ok
    }
    __throw_typeerror(opname, x, y);
}
function __sub(x, y) {
    __assert_numbers(x, y, "__sub");
    return x /*loose*/ - y;
}
function __mul(x, y) {
    __assert_numbers(x, y, "__mul");
    return x /*loose*/ * y;
}
function __div(x, y) {
    __assert_numbers(x, y, "__div");
    return x /*loose*/ / y;
}
function __mod(x, y) {
    __assert_numbers(x, y, "__mod");
    return x /*loose*/ % y;
}
function __bitand(x, y) {
    __assert_numbers(x, y, "__bitand");
    return x /*loose*/ & y;
}
function __bitor(x, y) {
    __assert_numbers(x, y, "__bitor");
    return x /*loose*/ | y;
}
function __bitxor(x, y) {
    __assert_numbers(x, y, "__bitxor");
    return x /*loose*/ ^ y;
}
function __bitasl(x, y) {
    __assert_numbers(x, y, "__bitasl");
    return x /*loose*/ << y;
}
function __bitasr(x, y) {
    __assert_numbers(x, y, "__bitasr");
    return x /*loose*/ >> y;
}
function __bitlsr(x, y) {
    __assert_numbers(x, y, "__bitlsr");
    return x /*loose*/ >>> y;
}
function __bitnot(v) {
    var vtype = typeof v;
    if (vtype === "number") {
        return /*loose*/ ~v;
    }
    __throw_typeerror("__bitnot", v);
}

// += -= *= /= %= &= |= ^= <<= >>= >>>=
// expr1[expr2] += v is translated into __op_to(__add, expr1, String(expr2), v)
// expr.id += v is translated into __op_to(__add, expr, "id", v)
// id += v is translated into id = __add(id, v)
// ++id is translated into (id = __inc(id))
// ++expr1[expr2] is translated into __prefinc(expr1, String(expr2))
// ++expr.id is translated into __prefinc(expr1, "id")
// id++ is translated into __arg0(id, id = __inc(id))
//   [other options (id = __inc(id), __dec(id)) or (check(id), id/*loose*/++)]
// expr1[expr2]++ is translated into __postinc(expr1, String(expr2))
// expr.id++ is translated into __postinc(expr1, "id")
// i = f(i, i+=1)
function __arg0(x) {
    return x;
}

function __op_to(fn, base, name, v) {
    return base[name] = fn(base[name], v);
}
function __prefinc(base, name) {
    return base[name] = __inc(base[name]);
}
function __postinc(base, name) {
    var tmp = base[name];
    base[name] = __inc(tmp);
    return tmp;
}

function assertEquals(l, r) {
    if (l === r) {
//        log("PASS " + l);
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
        //log("PASS " + e);
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
assertEquals(__sub(1,2), -1);
assertThrows(function() { __sub("1", 0); });

function __toBoolean(v) {
    // short version
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
    // TODO fix bug handle "function" like "object"
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

// x[y] += ... where both x and y are expressions
a = [0,2,4];
assertEquals((function(){return a;})()[f()] += 1, 3);
assertEquals(a[1], 3);
a = [0,2,4];
tmp1 = undefined, tmp2 = undefined;
assertEquals((tmp2=(function(){return a;})())[tmp1=f()] =
             __loose_add(tmp2[tmp1], 1), 3);
assertEquals(a[1], 3);

// (null || a)[f()] += a[0]
__op_to(__add, Object(null || a), String(f()), a[0]);

// ofn().x += a[0], ((ofn().x)) += a[0]
__op_to(__add, Object(ofn()), String("x"), a[0]);

// x += 1 + 2;
var x = 0;
(x = __add(x, 1 + 2));

// ofn() += 1 and all other forms should crash with ReferenceError so
// give translation error

function test_binary_operator() {
    function create_getter(o, key, val) { // why can't it be in the loop?
        o[key] = function() { return val; };
        return o;
    }
    var values = {
        "undefined": [undefined],
        "boolean": [true, false],
        "Boolean": [new Boolean(true), new Boolean(false)],
        "number": [0, 0.1, 0.5, 1, 1.1, 1.5, 2, 3, 8, 10, 11, 20, 100,
                   0, 319676400000, 1285279200000, // Dates
                   Number.MAX_VALUE, Number.MIN_VALUE,
                   Infinity, NaN],
        "Number": [],
        "string": ["", " ", "  ",
                   "undefined", "true", "false",
                   "a", "b", "xy", "zw", "qwerty"],
        "String": [],
        "Date": [new Date(0), new Date(1980, 1, 18), new Date(2010, 8, 24)],
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

    // populate number with dates
    for (i = 0, len = values["Date"].length; i < len; ++i) {
        values["number"].push(Number(values["Date"][i]));
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

    create_valueOf_toString("object", Object);
    /*
    create_valueOf_toString("function", Function);
    create_valueOf_toString("Boolean", Boolean);
    create_valueOf_toString("Number", Number);
    create_valueOf_toString("String", String);
    create_valueOf_toString("Date", Date);
    create_valueOf_toString("array", Array);
*/
    flat = [];
    for (var type in values) {
        log(type +": "+ String(values[type].length));
        flat = flat.concat(values[type]);
    }
    log(flat.length);

    var j;
    for (i = 0; i < flat.length; i++) {
        for (j = 0; j < flat.length; j++) {
            var exc_a = false, exc_b = false;
            var val_a, val_b;
            try { val_a = flat[i] == flat[j]; }
            catch (e) { exc_a = e; }

            try { val_b = __loose_eq(flat[i], flat[j]); }
            catch (e) { exc_b = e; }

            if (exc_a || exc_b) {
                assertEquals(!!exc_a, !!exc_b);
            }
            else {
                if (val_a !== val_b && !(isNaN(val_a) && isNaN(val_b))) {
                    log(String.concat("  ", "i=", i, " j=", j));
                    log(String.concat("  ", flat[i], " == ",
                                      flat[j], ": ", val_a));
                    log(String.concat("  ", "__loose_eq(", flat[i], ", ",
                                      flat[j], "): ", val_b));
                    inspect(flat[i]);
                    inspect(flat[j]);
                    assertEquals(true, false);
                }
            }
        }
    }
}

function inspect(v) {
    log("inspect "+ String(v) +" {");
    log("  typeof: "+ typeof v);
    log("  constructor: "+ v.constructor);
    log("  valueOf: "+ v.valueOf || "undefined");
    log("  toString: "+ v.toString || "undefined");
    var val;
    if (v.valueOf) {
        val = v.valueOf();
        log("  valueOf(): "+ val +" ("+ typeof val +")");
    }
    if (v.toString) {
        val = v.toString();
        log("  toString(): "+ val +" ("+ typeof val +")");
    }
    log("}");
}

//test_binary_operator();

function jsvm_differences(vmstr) {
    var vm = {sm: vmstr === "sm", v8: vmstr === "v8",
              jsc: vmstr === "jsc", ecma: vmstr == "ecma"};

    // sm, v8, jsc yield true, ecma (my interpretation) yields false
    assertEquals(false == {valueOf: function() { return null; }}, !vm.ecma);

    assertEquals("" == {valueOf: function() { return null; }}, vm.sm);

    assertEquals(false == new Date(0), !vm.sm);

    // lots of other Date differences
}
//jsvm_differences("sm");
