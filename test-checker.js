"use strict";

load('checker.js');
load('assert.js');

function testParser() {
//    assertEquals(parse("1").start, 0);
//    printTree(parse("var x = 1"));
//    printTree(parse("function f(a,b) {c;}var c = function(){};f(1,2);"));
//    printTree(parse("x = (1+(2 + 3))"));
//    printTree(parse("f(1,2);f[1];f.a;[1,2];"));
//    printTree(parse("{1   }; if(1) {2} try {1;} catch(e){}"));
//    printTree(parse("(v+3);a"));
//    printTree(parse("x = 1"));
//    printTree(parse("x = 1, 2;;"));
//    printTree(parse("throw 1\nx=2"));
//    printTree(parse("throw 1;x=2\n;;"));
//    printTree(parse("if (1) print(2)\n;else{print(3)}"));
//    printTree(parse("[1, , 2]"));
//    printTree(parse("2 * ( 3 + 4 )"));
//    printTree(parse("function f() { ((yield 1), 2); }"));
    printTree(parse("switch (e) {case 1 : 2; case 3: default:}"));
}
//testParser();

var src;
//src = "x = 1+\n2;\nprint(y);for (s.x in o) {}";
//src = "switch(a+b) { case c+d: e+f; case g+h: i+j; default: k+l; }";
//src = "try { a+b; } catch (x if c+d) { e+f; } catch (y) { g+h; } finally { i+j; }";
//src = "var x = a+b, y = c+d; const z = e+f, w = g+h";
//src = "var o = {get prop() { a+b; }, set prop(val) { c+d; }}";
//src = "var x = 1, y = 2; f(1, 2); a, function f(a, b) {}; x = a, b;";
//src = "a, b, c";
//src = "\"no restrict\", function add(a, b) { return a+b; }";
//src = "; var x   = f  (! y   + 3)";
//src = "x &&a*3 +b || y";
//src = "++id; ++expr.id; ++expr1[expr2]; --id; --expr.id; --expr1[expr2]; id++; expr.id++; expr1[expr2]++; id--; expr.id--; expr1[expr2]--;";
src = "id += v; expr.id += v; expr1[expr2] += v";
var root = parse(src);

print(root.getSrc());
//printTree(root);
alterTree(root);
print(root.getSrc());
//printTree(root);
// print();
// print(src);
//load('narcissus/lib/jsdecomp.js');
//print(Narcissus.decompiler.pp(root));
//printTree(parseExpression("if (1+2) 3;"));

print("test-checker.js done");
