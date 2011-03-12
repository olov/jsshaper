function __eq(x, y) {
    throw new Error("restrict pedantic mode disallows the == operator, use === or /**loose*/ annotate instead");
}
function __ne(x, y) {
    throw new Error("restrict pedantic mode disallows the != operator, use !== or /**loose*/ annotate instead");
}
function __lt(x, y) {
    __assert_numbers("<", x, y);
    return /*loose*/(x < y);
}
function __gt(x, y) {
    __assert_numbers(">", x, y);
    return /*loose*/(x > y);
}
function __le(x, y) {
    __assert_numbers("<=", x, y);
    return /*loose*/(x <= y);
}
function __ge(x, y) {
    __assert_numbers(">=", x, y);
    return /*loose*/(x >= y);
}
function __uplus(v) {
    throw new Error("restrict pedantic mode disallows the +v operator, use Number(v) instead");
}
function __add(x, y) {
    __assert_numbers("+", x, y);
    return /*loose*/(x + y);
}
