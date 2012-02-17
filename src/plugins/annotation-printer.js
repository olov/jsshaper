if (typeof define !== 'function') { var define = require('amdefine')(module); }

define(['../shaper', '../fmt', './annotater'], function(Shaper, Fmt, Annotater){
"use strict"; "use restrict";

var log = (typeof console !== "undefined") && console.log || print;

Annotater(/[\s\*](@[_$a-zA-Z0-9]*)/, function(node, match) {
    log(Fmt("{0} annotates {1}", match[1], node.toString(false)));
});
Shaper("annotation-printer", function() {});

    return Shaper.get("annotation-printer");
});
