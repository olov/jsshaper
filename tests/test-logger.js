"use strict"; "use restrict";

var require = require || function(f) { load(f); };
var Log = Log || require("./log.js") || Log;
var Fmt = Fmt || require("./fmt.js") || Fmt;

function myfn(x) {
    Log("descriptive log-message");
    Log(Fmt("Log can be called with any expression. x={0}", x));
    Log("It provides formatting via Fmt. x={0}", x);
    Log([1, 2, 3]);
    Log({key: "value"});
    Log(/*asdf*/ /*zxcv*/);
    Log.verb("test-logger.js", 14, "myfn", "It provides formatting via Fmt. x={0}", x);
}
myfn(3);
