"use strict"; "use restrict";

var require = require || function(f) { load(f); };
var Watch = Watch || require("../watch.js") || Watch;
var Log = Log || require("../../../log.js") || Log;

// watch o for invalid age [1]
var o = {name: "marvin", age: 100000};
Watch(o, "age", function() {
    if (o.age < 0) {
        Log("invalid age ({0})", o.age);
    }
});

// watch arr for non-string assignments [2]
var arr = ["asdf", "zxcv"];
Watch(arr, null, function(arr, name, op) {
    var v = arr[name];
    if (typeof v !== "string") {
        Log("arr[{0}] assigned with {1} of type {2}", name, v, typeof v);
    }
});

// watch Array.prototype for patches [3]
Watch(Array.prototype, null, function(obj, name, op) {
    Log("patched Array.prototype.{0}", name);
});

// modify push so that pushes are watched, too. triggers [3]
Array.prototype.push = function(v) {
    return this[this.length] = v;
};

o.age += 1;
o["age"] /= -1; // triggers [1]
arr[2] = "ok";
arr.push(0); // triggers [2]
