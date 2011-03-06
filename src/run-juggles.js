"use strict"; "use restrict";

if (arguments.length > 0 && arguments[0] === "--") {
    arguments.shift();
}
if (arguments.length <= 0) {
    print("run-juggles: filename");
    quit();
}
var filename = arguments[0];

load("juggles.js");
load("restrict-checker.js");
var readfile = this.snarf || this.read;

var src = readfile(filename);
var root = parse(src, filename);
root = runAnnotations(root);
root = runJugglers(root);

//alterTree(root);
//var header = 'load("restrict-prelude.js");\n';
//print(header);
//print(root.getSrc()); // TODO remove trailing newline added by print
//printTree(root);
//print("run-juggles.js done");
