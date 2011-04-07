"use strict"; "use restrict";

var Watch = (function() {
    var objs = [];
    var names = [];
    var fns = [];
    function watch(obj, name, fn) {
        objs.push(obj);
        names.push(name);
        fns.push(fn);
    }
    function clear() {
        objs = [];
        names = [];
        fns = [];
    }
    function set(op, obj, name, value) {
        var ret;
        switch(op) {
          case "=": ret = obj[name] = value; break;
          case "++v": ret = ++obj[name]; break;
          case "v++": ret = obj[name]++; break;
          case "--v": ret = --obj[name]; break;
          case "v--": ret = obj[name]--; break;
          case "+=": ret = obj[name] += value; break;
          case "-=": ret = obj[name] -= value; break;
          case "*=": ret = obj[name] *= value; break;
          case "/=": ret = obj[name] /= value; break;
          case "%=": ret = obj[name] %= value; break;
          case "&=": ret = obj[name] &= value; break;
          case "|=": ret = obj[name] |= value; break;
          case "^=": ret = obj[name] ^= value; break;
          case "<<=": ret = obj[name] <<= value; break;
          case ">>=": ret = obj[name] >>= value; break;
          case ">>>=": ret = obj[name] >>>= value; break;
        }
        for (var i = 0; i < fns.length; i++) {
            if ((objs[i] === obj || objs[i] === null) &&
                (names[i] === name || names[i] === null)) {
                fns[i](obj, name, op);
            }
        }
        return ret;
    }
    watch.watch = watch;
    watch.clear = clear;
    watch.set = set;
    return watch;
})();

if (typeof exports !== "undefined") {
    module.exports = Watch;
}
