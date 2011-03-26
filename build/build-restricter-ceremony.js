//var load, require = require || function(f) { load(f); };
// run with d8
var filename = "../build/all-restricter.js";

var read = read || require("fs").readFileSync;
var src = read(filename);
var root = Shaper.parseScript(src, filename);
Shaper.run(root, ["annotater", "restricter", "source"]);
