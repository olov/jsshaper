(/* a @type */ "2"-0);
/* b @type */("4"-1)+3;
var x = 1;
/** c @type */
var y = 3;
/** d @type */
function f() {}

function g() /**e*/ {}

function h() {/*block inline comment*/}

(/**f*/ f.x /**post*/);

/*semicolon_comment*/ o = /*object_init_comment*/ {
    /*property_init_comment*/ first: 42,
    second: 1
};
(/*array_init_comment*/[1,2,3]);
