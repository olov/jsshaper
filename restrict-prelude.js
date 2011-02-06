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
function __throw_typeerror(from, var_args) {
    var args = Array.prototype.slice.call(arguments, 1, arguments.length);
    var typeofs = args.map(detailedtypeof).join(" and ");
    throw new Error("restrict mode ".concat(from, " called with ", typeofs));
}
function __assert_numbers(x, y, opname) {
    var xtype = typeof x;
    var ytype = typeof y;
    if (xtype === "number" && xtype === ytype) {
        return; // ok
    }
    __throw_typeerror(opname, x, y);
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
function __gt(x, y) {
    var xtype = typeof x;
    var ytype = typeof y;

    if (xtype === ytype) {
        if ((xtype === "string" || xtype === "number")) {
            return x /*loose*/ > y;
        }
    }
    __throw_typeerror("__gt", x, y);
}
function __le(x, y) {
    var xtype = typeof x;
    var ytype = typeof y;

    if (xtype === ytype) {
        if ((xtype === "string" || xtype === "number")) {
            return x /*loose*/ <= y;
        }
    }
    __throw_typeerror("__le", x, y);
}
function __ge(x, y) {
    var xtype = typeof x;
    var ytype = typeof y;

    if (xtype === ytype) {
        if ((xtype === "string" || xtype === "number")) {
            return x /*loose*/ >= y;
        }
    }
    __throw_typeerror("__ge", x, y);
}

function __neg(v) {
    var vtype = typeof v;
    if (vtype === "number") {
        return /*loose*/ -v;
    }
    __throw_typeerror("__neg", v);
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
