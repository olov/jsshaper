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
while (args.length > 0) {
    var shapename = args.shift();
    if (shapename === "--tree") {
        Shaper.shape(Shaper.printTree);
    }
    else if (shapename === "--print") {
        Shaper.shape(Shaper.printSource);
    }
    else {
        require("./"+ shapename);
    }
}

var read = read || require("fs").readFileSync;
var src = read(filename);
var root = Shaper.parse(src, filename);
root = Shaper.run(root);
