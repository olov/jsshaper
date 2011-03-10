"use strict"; "use restrict";
var load, require = require || load;
var args = (typeof process !== "undefined" && process.argv !== undefined) ?
    process.argv.slice(2) : arguments;

if (args.length > 0 && args[0] === "--") {
    args.shift();
}
if (args.length <= 0) {
    print("run-shaper: [shape1 .. shapeN] filename");
    quit();
}
var filename = args.pop();

var Shaper = Shaper || require("./shaper.js") || Shaper;

var pipeline = [];
while (args.length > 0) {
    var shapename = args.shift();

    if (shapename.slice(0,2) === "--") { // builtin
        pipeline.push(shapename.slice(2));
    }
    else { // plugin
        require("./"+ shapename);
        pipeline.push(shapename.slice(0, shapename.length - 3));
    }
}

var read = read || require("fs").readFileSync;
var src = read(filename);
var root = Shaper.parseScript(src, filename);
root = Shaper.run(root, pipeline);
