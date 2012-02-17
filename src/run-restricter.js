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
if (args.length !== 1) {
    log("run-restricter: filename");
    (typeof quit === "undefined" ? process.exit : quit)(0);
}
var filename = args.shift();

if (typeof process !== "undefined" && process.argv !== undefined) {
    process.argv = process.argv.slice(0, 2);
    args = process.argv;
}
args.push(filename, "plugins/annotater.js", "plugins/restricter.js", "--source");
require("./run-shaper.js");
