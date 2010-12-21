/*
To string: ""+ 101 eller String(101)
To number: +"101" eller Number("101")
To boolean: !!101
*/


/*
WTF
1 < true
+[[[7]]] = 7
-[[[7]]] = 7
new Number(3) != new Number(3)
workaround n1 <= n2 && n2 >= n1
new Number(3) == 3
*/
function __typeof(v) {
    var t = typeof v;
    return t !== 'object' ? t :
        Array.isArray(v) ? "array" :
        v !== null ? typeof v.valueOf() : "object";
}

function __str_concat(arg0) {
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
}
function __lt(l, r) {
    var ltype = typeof l;
    var rtype = typeof r;

    if (ltype === rtype) {
        if ((ltype === "string" || ltype === "number")) {
            return l < r;
        }
        if (ltype === "object" && Array.isArray(l) && Array.isArray(r)) {
            for (var i = 0, len = Math.min(l.length, r.length); i < len; i++) {
                if (l[i] === r[i]) {
                    continue;
                }
                return __lt(l[i], r[i]);
            }
            return l.length < r.length;
        }
    }
    throw new Error("restrict mode __lt called with "+
                    ltype +" and "+ rtype);
    // TODO print array instead of object in error message
}
function __uadd(v) {
    // TODO remove altogether and require explicit Number("101") str->num?
    var vtype = typeof v;
    // doesn't support boxed Number or String (yet?)
    if (vtype === "number" || vtype === "string") {
        return +v;
    }
    throw new Error("restrict mode __uadd called with "+ vtype);
}

function __sub(l, r) { // binary sub, TODO unary sub
    var ltype = typeof l;
    var rtype = typeof r;
    // doesn't support boxed Number or String (yet?)
    if (ltype === "number" && ltype === rtype) {
        return l - r;
    }
    throw new Error("restrict mode __sub called with "+
                    ltype +" and "+ rtype);
}

function __add(l, r) { // binary sub, TODO unary sub
    var ltype = typeof l;
    var rtype = typeof r;
    // doesn't support boxed Number or String (yet?)
    if (ltype === "number" && ltype === rtype) {
        return l - r;
    }
    throw new Error("restrict mode __sub called with "+
                    ltype +" and "+ rtype);
}

if (this.console === undefined) {
    console = {log: print};
}

function assertEquals(l, r) {
    if (l === r) {
        console.log("PASS " + l);
    }
    else {
        console.log("FAIL " + l + " != " + r);
        throw new Error("assertion failed");
    }
}

function assertThrows(fn) {
    try {
        fn();
    }
    catch (e) {
        console.log("PASS " + e);
        return;
    }
    console.log("FAIL no exception thrown");
    throw new Error("assertion failed");
}

Array.isArray = Array.isArray || function(o) {
    return Object.prototype.toString.call(o) === '[object Array]';
};

var _str = __str_concat;
assertEquals(_str(), "");
assertEquals(_str(""), "");
assertEquals(_str("one"), "one");
assertEquals(_str(1), "1");
assertEquals(_str("one", 2), "one2");
assertEquals(_str("one", 2, "three", 4), "one2three4");

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
//test__typeof();
assertEquals(__lt(1, 2), true);
assertEquals(__lt("abc", "bac"), true);
assertEquals(__lt("abc", "abc"), false);
assertEquals(__lt([1,2,3], [2,3,4]), true);
assertEquals(__lt([1,2,3], [0,3,4]), false);
assertThrows(function() { __lt([[2]], [["1"]]); } );
assertThrows(function() { __lt(new Number(1), 2); }, true);
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

