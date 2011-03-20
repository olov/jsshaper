/**
 * @param {number} a explain-a
 * @param {number} b explain-b
 *
 */

function adder(a, b) {
    return a+b;
}
adder(1,2);
//adder(1,"2");
adder(1, /** @type {boolean} */ "2"-0); // no-op (no parens)
adder(1, /** @type {boolean} */("2")-0); // cast string to boolean
adder(1, (/** @type {boolean} */ "2")-0); // cast string to boolean
adder(1, /** @type {boolean} */("2"-0)); // cast number to boolean
adder(1, (/** @type {boolean} */ "2"-0)); // cast number to boolean

adder(1, /** @type {boolean} */ "2"); // no-op (no parens)
adder(1, /** @type {boolean} */("2")); // cast string to boolean
adder(1, (/** @type {boolean} */ "2")); // cast string to boolean

adder(1, (function() { return (/** @type {boolean} */ "2"); })());
//print(( 1) + 2);
