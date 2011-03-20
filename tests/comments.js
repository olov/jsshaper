if (/*1*/ x /*2*/ + /*3*/ y /*4*/);
if (/*1*/ ! /*2*/ x /*3*/);
if (/*1*/ x /*2*/ ++ /*3*/);
//leading comment
if (/*pre0*/ /*pre*/ x/*post*/) {
}
if (//pre
    x/*post*/) {
    /*01*/a/*02*/;
    /*03*/b/*04*/
    /*05*/(c/*06*/);
}
x;
function f() /*a*/ { /*b*/ x; /*c*/ }
/* trailing comment */
