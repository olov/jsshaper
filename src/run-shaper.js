"use strict"; "use restrict";

if (arguments.length > 0 && arguments[0] === "--") {
    arguments.shift();
}
if (arguments.length <= 0) {
    print("run-shaper: filename");
    quit();
}
var filename = arguments[0];

load("shaper.js");
load("annotater.js");
load("restrict-checker.js");

var src = read(filename);
var root = parse(src, filename);
root = Shaper.run(root);
