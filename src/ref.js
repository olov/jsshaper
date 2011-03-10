"use strict"; "use restrict";

var Fmt = Fmt || require("./fmt.js") || Fmt;
var Ref = (function() {
    // examples:
    // {base: obj, prop: ["property"]}
    // {base: obj, prop: ["children", "0"]
    function Ref(base, var_args) {
        this.base = base;
        this.prop = Array.prototype.slice.call(arguments, 1);
    }
    Ref.prototype.canonical = function() {
        var i;
        var base = this.base;
        for (i = 0; i < this.prop.length - 1; i++) {
            base = base[this.prop[i]];
        }
        var prop = this.prop[i];
        return new Ref(base, prop);
    };
    Ref.prototype.set = function(value) {
        var ref = this.canonical();
        ref.base[ref.prop[0]] = value;
    };
    Ref.prototype.get = function() {
        var ref = this.canonical();
        return ref.base[ref.prop[0]];
    };
    Ref.prototype.toString = function() {
        return Fmt('ref["{0}"]', this.prop.join('"]["'));
    };
    return Ref;
})();

if (typeof exports !== "undefined") {
    module.exports = Ref;
}
//print("ref done");
