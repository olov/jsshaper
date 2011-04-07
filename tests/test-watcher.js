"use strict"; "use restrict";

var require = require || function(f) { load(f); };
var Watch = Watch || require("./plugins/watcher/watch.js") || Watch;
var Fmt = Fmt || require("./fmt.js") || Fmt;

var o1 = {name: "marvin", age: 100000};
var arr = ["asdf", "zxcv"];
Watch(o1, "age", function() {
    if (o1.age < 0) {
        throw new Error("age out of range");
    }
});
Watch(arr, null, function(arr, name, op) {
    if (typeof arr[name] !== "string") {
        throw new Error("array assignment of type "+ typeof arr[name]);
    }
});
Array.prototype.push = function(v) {
    return this[this.length] = v;
};
o1.age += 1;
arr[2] = "ok";
arr.push(0);
o1["age"] /= -1;
