"use strict"; "use restrict";
var require = require || function(f) { load(f); };
try {
require.paths && typeof __dirname !== "undefined" && require.paths.unshift(__dirname);
} catch (e) { /* require.paths disabled in node 0.5+ */ }
var args = (typeof process !== "undefined" && process.argv !== undefined) ?
    process.argv.slice(2) : arguments;
var log = (typeof console !== "undefined") && console.log || print;

if (args.length > 0 && args[0] === "--") {
    args.shift();
}
if (args.length <= 0) {
    log("run-shaper: filename [shape1 .. shapeN]");
    (typeof quit === "undefined" ? process.exit : quit)(0);
}
var filename = args.shift();

var Shaper = Shaper || require("./shaper.js") || Shaper;

var pipeline = [];
while (args.length > 0) {
    var shapename = args.shift();

    if (shapename.slice(0,2) === "--") { // builtin
        pipeline.push(shapename.slice(2));
    }
    else { // plugin
        require('./'+shapename);
        var slash = shapename.lastIndexOf("/");
        pipeline.push(shapename.slice(slash !== -1 ? slash + 1 : 0, shapename.length - 3));
    }
}

// read: js/d8/v8 || rhino || node
var read = read || typeof readFile !== "undefined" && readFile || require("fs").readFileSync;
var src = read(filename);
var root = Shaper.parseScript(src, filename);
root = Shaper.run(root, pipeline);
