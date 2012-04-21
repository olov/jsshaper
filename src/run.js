"use strict"; "use restrict";

var require = require || function(f) { load(f); };
try {
require.paths && typeof __dirname !== "undefined" && require.paths.unshift(__dirname);
} catch (e) { /* require.paths disabled in node 0.5+ */ }
require((typeof process !== "undefined" && process.argv !== undefined) ?
        (process.argv.shift(), process.argv.shift(), process.argv.shift()) :
        arguments.shift());
