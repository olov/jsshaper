"use strict"; "use restrict";

function __typeof(v) {
    var t = typeof v;
    return t !== 'object' ? t :
        Array.isArray(v) ? "array" :
        v !== null ? typeof v.valueOf() : "object";
}

function test__typeof() {
    assertEquals(__typeof(0), "number");
    assertEquals(__typeof(false), "boolean");
    assertEquals(__typeof(true), "boolean");
    assertEquals(__typeof(new Boolean(false)), "boolean");
    assertEquals(__typeof(new Boolean(true)), "boolean");
    assertEquals(__typeof([]), "array");
    assertEquals(__typeof([1,2,3]), "array");
    assertEquals(__typeof(new Array()), "array");
    assertEquals(__typeof(new Array(1,2,3)), "array");
    assertEquals(__typeof(undefined), "undefined");
    assertEquals(__typeof(null), "object");
    assertEquals(__typeof(new Object()), "object");
    assertEquals(__typeof({}), "object");
    assertEquals(__typeof({toString: function() { return 1; }}), "object");
    assertEquals(__typeof({toString: function() { return 1; }}), "object");
    // TODO should valueOf be valid in restrict mode?
    // ie __lt({valueOf: function() { return 1; }}, 2)
    assertEquals(__typeof({valueOf: function() { return 1; }}), "number");
    assertEquals(__typeof(new Number(1.0)), "number");
    assertEquals(__typeof(new Number(1)), "number");
    assertEquals(__typeof(new Number(0)), "number");
    assertEquals(__typeof(new Number(NaN)), "number");
    assertEquals(__typeof(new Number(Infinity)), "number");
    assertEquals(__typeof(NaN), "number");
    assertEquals(__typeof(Infinity), "number");
    assertEquals(__typeof(1.0), "number");
    assertEquals(__typeof(1), "number");
    assertEquals(__typeof(0), "number");
    assertEquals(__typeof(new String("str")), "string");
    assertEquals(__typeof(new String("1")), "string");
    assertEquals(__typeof(new String("0")), "string");
    assertEquals(__typeof("str"), "string");
    assertEquals(__typeof("1"), "string");
    assertEquals(__typeof("0"), "string");
    assertEquals(__typeof(""), "string");
    assertEquals(__typeof(new String("")), "string");
    assertEquals(__typeof(function() { return 1; }), "function");
    assertEquals(__typeof(new Function("return 1;")), "function");
    assertEquals(__typeof((function () { return arguments; })(1,2)), "object");
    assertEquals(__typeof(/a/), "function");
    assertEquals(__typeof(new RegExp()), "function");
    // typeof Date === "object" but Date.prototype.valueOf converts to number
    assertEquals(__typeof(new Date()), "number");
}

Array.isArray = Array.isArray || function(o) {
    return Object.prototype.toString.call(o) === '[object Array]';
};

var log = print;

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

