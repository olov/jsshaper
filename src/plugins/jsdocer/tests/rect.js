/**
 * Rect constructor function
 *
 * @constructor
 * @this {Rect}
 * @param {number} w width
 * @param {number} h height
 */
function Rect(w, h) {
    /** @private */ this.w = w;
    /** @private */ this.h = h;
}

/**
 * Creates a square Rect
 *
 * @param {number} l The side length
 * @return {Rect} The new Rect object
 */
Rect.square = function (l) {
    return new Rect(l, l);
};

/**
 * Calculates the Rect area
 *
 * @deprecated
 * @this {Rect}
 * @return {number} The area
 */
Rect.prototype.area = function () {
    return this.w * this.h;
};

/**
 * Calculates the Rect perimeter
 *
 * @this {Rect}
 * @return {number} The perimiter
 */
Rect.prototype.perimeter = function () {
    return 2 * (this.w + this.h);
};

/**
 * Rect string representation
 *
 * @override
 * @this {Rect}
 * @return {string} String representation
 */
Rect.prototype.toString = function () {
    return "Rect ["+ this.w +", "+ this.h +"]";
};
