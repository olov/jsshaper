define('build-restricter', ['./shaper', 'plugins/restricter'], function(Shaper,_) {

var filename = "../build/all-restricter.js";
var src = require("fs").readFileSync(filename);
var root = Shaper.parseScript(src, filename);
Shaper.run(root, ["annotater", "restricter", "source"]);

});
