#!/bin/sh

# Build an optimized single-file s.js

node node_modules/r.js -o name=s include=plugins/asserter,plugins/bitwiser,plugins/logger,plugins/restricter,plugins/stringconverter,plugins/yielder/yielder out=s.opt.js baseUrl=.
