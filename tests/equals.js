"use strict";"use restrict";
var x = 1;
var y = "1";
var z = null;
var w = undefined;
print(/*loose*/(x == y));
print(/*loose*/(z != w));
print(x === y);
print(z !== w);

// throws exception in restrict mode:
//print(x == y);
//print(z != w);
