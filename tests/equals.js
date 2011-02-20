"use strict";"use restrict";
var x = 1;
var y = "1";
var z = null;
var w = undefined;
print(/*loose*/(x == y));
print(/*loose*/(z != w));
print(x === y);
print(z !== w);

print(NaN == NaN);
print(NaN === NaN);
print(1 < undefined);
// throws exception in restrict mode:
//print(x == y);
//print(z != w);
