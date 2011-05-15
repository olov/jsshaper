"use strict"; "use restrict";

var require = require || function(f) { load(f); };
require.paths && typeof __dirname !== "undefined" && require.paths.unshift(__dirname);
require((typeof process !== "undefined" && process.argv !== undefined) ?
        (process.argv.shift(), process.argv.shift(), process.argv.shift()) :
        arguments.shift());
