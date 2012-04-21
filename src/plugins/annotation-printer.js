"use strict"; "use restrict";

var Shaper = Shaper || require("../shaper.js") || Shaper;
var Fmt = Fmt || require("../fmt.js") || Fmt;
var Annotater = Annotater || require("./annotater.js") || Annotater;
var log = (typeof console !== "undefined") && console.log || print;

Annotater(/[\s\*](@[_$a-zA-Z0-9]*)/, function(node, match) {
    log(Fmt("{0} annotates {1}", match[1], node.toString(false)));
});
Shaper("annotation-printer", function() {});
