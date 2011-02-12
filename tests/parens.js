1;

// valid annotations
/*loose*/function f(x){}
function f(x)/*loose*/ {}
function f(x) /*loose*/{}
function f(x) {/*loose*/ return (x+1)/2;}
function f(x) {/*loose*/}

(/*loose*/x);
1 + (/*loose*/(x))-1 < y;
0 * /*loose*/(x-1+2) < y;
1 ? /*loose*/ null : 2;

// annotation errors
//if /*loose*/ (1) {2;}
//function /*loose*/g(x) {}
//function h/*loose*/(x) {}
//function i(/*loose*/x) {}
2;
