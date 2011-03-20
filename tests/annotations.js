(/*minus comment*/ "2"-0);
(/*first*/   /*second*/"2"-0);
/*semicolon comment*/("4"-1)+3;
(/*number comment*/1);
var x = 1;
/** @type1 */
var y = 3;
/** @type2 {asdf} */
function f() {}

// line1

// line2
function g() /**e*/ {}

function h() {/*block inline comment*/}

(/**f*/ f.x /**post*/);

/*semicolon comment*/ o = /*object_init comment*/ {
    /*property_init comment*/ first: 42,
    second: 1
};
(/*array_init comment*/[1,2,3]);
