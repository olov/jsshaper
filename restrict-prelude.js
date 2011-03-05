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
//    print(e.stack);
    throw e;
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
    var eq_strict = (x === y);
    var eq_loose = /*loose*/(x == y);
    if (eq_strict === eq_loose ||
        (x === undefined && y === null || x === null && y === undefined)) {
        return eq_loose;
    }
    __throw_typeerror("==", x, y);
}
function __ne(x, y) {
    var ne_strict = (x !== y);
    var ne_loose = /*loose*/(x != y);
    if (ne_strict === ne_loose ||
        (x === undefined && y === null || x === null && y === undefined)) {
        return ne_loose;
    }
    __throw_typeerror("!=", x, y);
}
function __lt(x, y) {
    var xtype = typeof x;
    var ytype = typeof y;

    if (xtype === ytype) {
        if ((xtype === "string" || xtype === "number")) {
            return /*loose*/(x < y);
        }
    }
    __throw_typeerror("<", x, y);
}
function __gt(x, y) {
    var xtype = typeof x;
    var ytype = typeof y;

    if (xtype === ytype) {
        if ((xtype === "string" || xtype === "number")) {
            return /*loose*/(x > y);
        }
    }
    __throw_typeerror(">", x, y);
}
function __le(x, y) {
    var xtype = typeof x;
    var ytype = typeof y;

    if (xtype === ytype) {
        if ((xtype === "string" || xtype === "number")) {
            return /*loose*/(x <= y);
        }
    }
    __throw_typeerror("<=", x, y);
}
function __ge(x, y) {
    var xtype = typeof x;
    var ytype = typeof y;

    if (xtype === ytype) {
        if ((xtype === "string" || xtype === "number")) {
            return /*loose*/(x >= y);
        }
    }
    __throw_typeerror(">=", x, y);
}
function __uplus(v) {
    return /*loose*/(+v);
}
function __neg(v) {
    __assert_number("unary -", v);
    return /*loose*/(-v);
}
function __add(x, y) {
    var xtype = typeof x;
    var ytype = typeof y;
    if (xtype === ytype) {
        if (xtype === "string") {
            return String.prototype.concat.call(x, y);
        }
        if (xtype === "number") {
            return /*loose*/(x + y);
        }
    }
    __throw_typeerror("+", x, y);
}
function __sub(x, y) {
    __assert_numbers("-", x, y);
    return /*loose*/(x - y);
}
function __mul(x, y) {
    __assert_numbers("*", x, y);
    return /*loose*/(x * y);
}
function __div(x, y) {
    __assert_numbers("/", x, y);
    return /*loose*/(x / y);
}
function __mod(x, y) {
    __assert_numbers("%", x, y);
    return /*loose*/(x % y);
}
function __bitand(x, y) {
    __assert_numbers("&", x, y);
    return /*loose*/(x & y);
}
function __bitor(x, y) {
    __assert_numbers("|", x, y);
    return /*loose*/(x | y);
}
function __bitxor(x, y) {
    __assert_numbers("^", x, y);
    return /*loose*/(x ^ y);
}
function __bitasl(x, y) {
    __assert_numbers("<<", x, y);
    return /*loose*/(x << y);
}
function __bitasr(x, y) {
    __assert_numbers(">>", x, y);
    return /*loose*/(x >> y);
}
function __bitlsr(x, y) {
    __assert_numbers(">>>", x, y);
    return /*loose*/(x >>> y);
}
function __bitnot(v) {
    __assert_number("~", v);
    return /*loose*/(~v);
}
function __inc(v) {
    __assert_number("++", v);
    return /*loose*/(v + 1);
}
function __dec(v) {
    __assert_number("--", v);
    return /*loose*/(v - 1);
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
