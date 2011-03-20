"use strict"; "use restrict";

var load, require = require || load;
var Shaper = Shaper || require("./shaper.js") || Shaper;
var Annotater = Annotater || require("./annotater.js") || Annotater;
var Fmt = Fmt || require("./fmt.js") || Fmt;

Annotater(/@[_$a-zA-Z0-9]*/, function(node, match) {
    console.log(Fmt("{0} annotates {1}", match, node));
});
Shaper("annotation-printer", function() {});
