"use strict";

//var arguments = this.arguments || ["tests/loop-continue.js"];
if (arguments.length > 0 && arguments[0] === '--') {
    arguments.shift();
}
if (arguments.length <= 0) {
    print("run-checker: filename");
    quit();
}
var filename = arguments[0];

load('checker.js');
var readfile = this.snarf || this.read;
var src = readfile(filename);
var root = parse(src);
alterTree(root);
var header = 'load("restrict-prelude.js");\n';
//print(header);
print(root.getSrc());
//printTree(root);
//print("run-checker.js done");
