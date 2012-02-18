define('build-restricter', ['./shaper', 'plugins/restricter'], function(Shaper,_) {
//var load, require = require || function(f) { load(f); };
// run with d8
var filename = "../build/all-restricter.js";

// read: js/d8/v8 || rhino || node
var read = read || typeof readFile !== "undefined" && readFile || require("fs").readFileSync;
var src = read(filename);
var root = Shaper.parseScript(src, filename);
Shaper.run(root, ["annotater", "restricter", "source"]);
});
