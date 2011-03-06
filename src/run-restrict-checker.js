"use strict"; "use restrict";

if (arguments.length > 0 && arguments[0] === "--") {
    arguments.shift();
}
if (arguments.length !== 1) {
    print("run-restrict-checker: filename");
    quit();
}
var filename = arguments.pop();
arguments.push("annotater.js", "restrict-checker.js", "--print", filename);

load("run-shaper.js");
