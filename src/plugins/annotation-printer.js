"use strict"; "use restrict";

var Shaper = Shaper || require("../shaper.js") || Shaper;
var Annotater = Annotater || require("../annotater.js") || Annotater;
var Fmt = Fmt || require("../fmt.js") || Fmt;
var log = (typeof console !== "undefined") && console.log || print;

Annotater(/@[_$a-zA-Z0-9]*/, function(node, match) {
    log(Fmt("{0} annotates {1}", match, node));
});
Shaper("annotation-printer", function() {});
