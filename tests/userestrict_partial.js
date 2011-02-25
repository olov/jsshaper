x + 1; // loose

function a() {
    function b() {
        "use restrict";
        function c() {
            return x + 1; // restrict
        }
        return x + 1; // restrict
    }
    return x + 1; // loose
}
function d() {
    return x + 1; // loose
}
function e() {
    function g() {
        "use strict"; "use restrict";
        return x + 1; // restrict
    }
    function f() {
        1; "use restrict";
        return x + 1; // loose
    }
    return x + 1; // loose
}
function h() {
    "use restrict trailing-info-such-as-versioning-or-options";
    return x + 1; // restrict
}
