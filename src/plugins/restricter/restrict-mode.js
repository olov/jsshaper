// This file implements run-time checking for JavaScript restrict mode
// <http://restrictmode.org>. It's used in conjunction with JSShaper
// <https://github.com/olov/jsshaper>

// Copyright (c) 2010, 2011 Olov Lassus <olov.lassus@gmail.com>

// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:

// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.

// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
// THE SOFTWARE.

"use strict"; "use restrict";

var __pedantic = false;
// replace __errorfn with a custom one if you like
// returns exception to be thrown, or null/undefined for continue
// __errorfn = null will talso hrow the exception
var __errorfn = function(e) {
  console.log(e.stack);
  return e;
};

function __verbosetypeof(v) {
    var t = typeof v;
    var m;
    return t !== "object" ? t :
        v === null ? "null" :
        Object.prototype.toString.call(v) === "[object Array]" ? "object (Array)" :
        typeof v.constructor === "function" &&
        (m = v.constructor.toString().match(/^function (.+)\(/)) ?
        "object (".concat(m[1], ")") :
        "object";
}
function __throw_typeerror(opname, var_args) {
    var args = Array.prototype.slice.call(arguments, 1, arguments.length);
    var typeofs = args.map(__verbosetypeof).join(" and ");
    var e = new Error("restrict mode ".concat(opname, " called with ", typeofs));

    if (!__errorfn || __errorfn(e)) {
        throw e;
    }
}
function __assert_number(opname, v) {
    var vtype = typeof v;
    if (vtype === "number") {
        return; // ok
    }
    __throw_typeerror(opname, v);
}
function __assert_numbers(opname, x, y) {
    var xtype = typeof x;
    var ytype = typeof y;
    if (xtype === "number" && xtype === ytype) {
        return; // ok
    }
    __throw_typeerror(opname, x, y);
}
function __eq(x, y) {
    if (__pedantic) {
        throw new Error("restrict pedantic mode disallows the == operator, use === or /*@loose*/ annotate instead");
    }
    return /*@loose*/(x == y);
}
function __ne(x, y) {
    if (__pedantic) {
        throw new Error("restrict pedantic mode disallows the != operator, use !== or /*@loose*/ annotate instead");
    }
    return /*@loose*/(x != y);
}
function __lt(x, y) {
    var xtype = typeof x;
    var ytype = typeof y;
    if (!(xtype === ytype && (xtype === "string" || xtype === "number"))) {
        __throw_typeerror("<", x, y);
    }
    return /*@loose*/(x < y);
}
function __gt(x, y) {
    var xtype = typeof x;
    var ytype = typeof y;
    if (!(xtype === ytype && (xtype === "string" || xtype === "number"))) {
        __throw_typeerror(">", x, y);
    }
    return /*@loose*/(x > y);
}
function __le(x, y) {
    var xtype = typeof x;
    var ytype = typeof y;
    if (!(xtype === ytype && (xtype === "string" || xtype === "number"))) {
        __throw_typeerror("<=", x, y);
    }
    return /*@loose*/(x <= y);
}
function __ge(x, y) {
    var xtype = typeof x;
    var ytype = typeof y;
    if (!(xtype === ytype && (xtype === "string" || xtype === "number"))) {
        __throw_typeerror(">=", x, y);
    }
    return /*@loose*/(x >= y);
}
function __uplus(v) {
    return /*@loose*/(+v);
}
function __neg(v) {
    __assert_number("unary -", v);
    return /*@loose*/(-v);
}
function __add(x, y) {
    var xtype = typeof x;
    var ytype = typeof y;
    // number + number -> addition
    // string + string -> concatenation
    // string + number or number + string -> concatenation
    if (!((xtype === "string" || xtype === "number") &&
          (ytype === "string" || ytype === "number"))) {
        __throw_typeerror("+", x, y);
    }
    return /*@loose*/(x + y); // number addition or string concatenation
}
function __sub(x, y) {
    __assert_numbers("-", x, y);
    return /*@loose*/(x - y);
}
function __mul(x, y) {
    __assert_numbers("*", x, y);
    return /*@loose*/(x * y);
}
function __div(x, y) {
    __assert_numbers("/", x, y);
    return /*@loose*/(x / y);
}
function __mod(x, y) {
    __assert_numbers("%", x, y);
    return /*@loose*/(x % y);
}
function __bitand(x, y) {
    __assert_numbers("&", x, y);
    return /*@loose*/(x & y);
}
function __bitor(x, y) {
    __assert_numbers("|", x, y);
    return /*@loose*/(x | y);
}
function __bitxor(x, y) {
    __assert_numbers("^", x, y);
    return /*@loose*/(x ^ y);
}
function __bitasl(x, y) {
    __assert_numbers("<<", x, y);
    return /*@loose*/(x << y);
}
function __bitasr(x, y) {
    __assert_numbers(">>", x, y);
    return /*@loose*/(x >> y);
}
function __bitlsr(x, y) {
    __assert_numbers(">>>", x, y);
    return /*@loose*/(x >>> y);
}
function __bitnot(v) {
    __assert_number("~", v);
    return /*@loose*/(~v);
}
function __inc(v) {
    __assert_number("++", v);
    return /*@loose*/(v + 1);
}
function __dec(v) {
    __assert_number("--", v);
    return /*@loose*/(v - 1);
}
function __arg0(x) {
    return x;
}
function __op_set(fn, base, name, v) {
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
function __prefdec(base, name) {
    return base[name] = __dec(base[name]);
}
function __postdec(base, name) {
    var tmp = base[name];
    base[name] = __dec(tmp);
    return tmp;
}
