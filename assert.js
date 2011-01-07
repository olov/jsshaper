function assertEquals(l, r) {
    if (l === r) {
        //print("PASS "+ l);
    }
    else {
        print("FAIL "+ l +" !== "+ r);
        throw new Error("assertion failed");
    }
}
function assertThrows(fn) {
    try {
        fn();
    }
    catch (e) {
        //print("PASS " + e);
        return;
    }
    print("FAIL no exception thrown");
    throw new Error("assertion failed");
}
