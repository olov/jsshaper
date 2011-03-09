"use strict"; "use restrict";
try {
    throw new Error("my exception");
}
catch (e) {
    for (var p in e) {
        print (p +": "+ e[p]);
    }
//    print(e.stack);
}
