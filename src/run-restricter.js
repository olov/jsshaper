"use strict"; "use restrict";
var load, require = require || function(f) { load(f); };
var args = (typeof process !== "undefined" && process.argv !== undefined) ?
    process.argv.slice(2) : arguments;

if (args.length > 0 && args[0] === "--") {
    args.shift();
}
if (args.length !== 1) {
    print("run-restrict-checker: filename");
    quit();
}
var filename = args.pop();

if (typeof process !== "undefined" && process.argv !== undefined) {
    process.argv = process.argv.slice(0, 2);
    args = process.argv;
}
else {
    args = arguments;
}
args.push("annotater.js", "plugins/restricter.js", "--print", filename);

require("./run-shaper.js");
