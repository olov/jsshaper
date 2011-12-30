"use strict"; "use restrict";

var Fmt = Fmt || require("./fmt.js") || Fmt;
var Ref = (function() {
    // examples:
    // {base: obj, properties: ["property"]}
    // {base: obj, properties: ["children", "0"]
    function Ref(base, var_args) {
        this.base = base;
        this.properties = Array.isArray(var_args) ? var_args :
            Array.prototype.slice.call(arguments, 1).map(function(name) {
                return String(name);
            });
    }
    Ref.prototype.canonical = function() {
        if (this.properties.length === 1) {
            return this;
        }
        var i;
        var base = this.base;
        for (i = 0; i < this.properties.length - 1; i++) {
            base = base[this.properties[i]];
        }
        var properties = this.properties[i];
        return new Ref(base, properties);
    };
    Ref.prototype.set = function(value) {
        var ref = this.canonical();
        return ref.base[ref.properties[0]] = value;
    };
    Ref.prototype.get = function() {
        var ref = this.canonical();
        return ref.base[ref.properties[0]];
    };
    Ref.prototype.toString = function(baseName) {
        var properties = this.properties.map(function(p) {
            p = String(p);
            return /^[0-9]+$/.test(p) ? Fmt("[{0}]", p) :
                /^[_$a-zA-Z][_$a-zA-Z0-9]*$/.test(p) ? Fmt(".{0}", p) :
                Fmt('["{0}"]', p);
        });
        return (baseName !== undefined ? baseName : "base") + properties.join("");
    };
    return Ref;
})();

if (typeof exports !== "undefined") {
    module.exports = Ref;
}
