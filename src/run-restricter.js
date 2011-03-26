"use strict"; "use restrict";
var load, require = require || function(f) { load(f); };
var args = (typeof process !== "undefined" && process.argv !== undefined) ?
    process.argv.slice(2) : arguments;
var log = (typeof console !== "undefined") && console.log || print;

if (args.length > 0 && args[0] === "--") {
    args.shift();
}
if (args.length !== 1) {
    log("run-restrict-checker: filename");
    (typeof quit === "undefined" ? process.exit : quit)(0);
}
var filename = args.shift();

if (typeof process !== "undefined" && process.argv !== undefined) {
    process.argv = process.argv.slice(0, 2);
    args = process.argv;
}
args.push(filename, "annotater.js", "plugins/restricter.js", "--print");
require("./run-shaper.js");
