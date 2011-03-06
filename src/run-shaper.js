"use strict"; "use restrict";

if (arguments.length > 0 && arguments[0] === "--") {
    arguments.shift();
}
if (arguments.length <= 0) {
    print("run-shaper: [shape1 .. shapeN] filename");
    quit();
}
var filename = arguments.pop();

load("shaper.js");
while (arguments.length > 0) {
    var shapename = arguments.shift();
    if (shapename === "--tree") {
        shape(printTree);
    }
    else if (shapename === "--print") {
        shape(printSource);
    }
    else {
        load(shapename);
    }
}

var src = read(filename);
var root = parse(src, filename);
root = Shaper.run(root);
