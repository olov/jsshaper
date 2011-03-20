"use strict"; "use restrict";
var a = [1,2,3];
for (x in a) {}
var r = (1 for (x in a));
var s = (1 for (x in a) for (y in a) if (true));
print(r);
