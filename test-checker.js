"use strict";

load('checker.js');
load('assert.js');

function parse(str) {
    return Narcissus.parser.parse(str, "test.js", 1);
}
function testParser() {
//    assertEquals(parse("1").start, 0);
//    printTree(parse("x = (1+(2 + 3))"));
//    printTree(parse("f(1,2);f[1];f.a;[1,2];"));
//    printTree(parse("{1   }; if(1) {2} try {1;} catch(e){}"));
//    printTree(parse("function f(a,b) {c;}var c = function(){};f(1,2);"));
//    printTree(parse("(v+3);a"));
//    printTree(parse("x = 1"));
//    printTree(parse("x = 1, 2;;"));
//    printTree(parse("throw 1\nx=2"));
//    printTree(parse("throw 1;x=2\n;;"));
//    printTree(parse("if (1) print(2)\n;else{print(3)}"));
//    printTree(parse("[1, , 2]"));
    printTree(parse("2 * ( 3 + 4 )"));
    printTree(parse("function f() { ((yield 1), 2); }"));
}
testParser();
