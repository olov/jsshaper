#!/bin/sh
# should be run from jsshaper/src

if ! which node > /dev/null ; then
  echo "build-restricter.sh: can't detect node"
  exit 1
fi

# all-restricter-eval.js is restricter with dependencies (including
# Shaper and Narcissus) assembled by the requirejs optimizer
node node_modules/r.js -o name=../build/almond.js include=plugins/restricter out=../build/all-restricter-eval.js baseUrl=. optimize=none

# all-restricter.js is a de-eval-ified version of
# all-restricter-eval.js so it runs right in strict mode.
node run-shaper.js ../build/all-restricter-eval.js plugins/deeval.js --source > ../build/all-restricter.js

# all-restricter-checked.js is a checked version of all-restricter.js
# (i.e. restricter checking itself)
node run-restricter.js -- ../build/all-restricter.js > ../build/all-restricter-checked.js

# all-restricter-checked-repeated.js is a checked version of
# all-restricter-checked.js (should be identical)
node run-restricter.js -- ../build/all-restricter-checked.js > ../build/all-restricter-checked-repeated.js
if ! diff -u ../build/all-restricter-checked.js ../build/all-restricter-checked-repeated.js ; then
  echo "build-restricter.sh: error building all-restricter-checked-repeated.js"
  echo "build-restricter.sh: (should be identical to all-restricter-checked.js)"
  exit 1
fi


# finally, we want to verify that all-restricter-checked works correctly.
# all-restricter-checked-bootstrapped.js is a checked version of
# all-restricter.js, created using all-restricter-checked.js and some ceremony
# (should be identical)
cat plugins/restricter/restrict-mode.js ../build/all-restricter-checked.js ../build/build-restricter-ceremony.js > ../build/all-build-restricter-ceremony.js
node ../build/all-build-restricter-ceremony.js > ../build/all-restricter-checked-bootstrapped.js

if ! diff -u ../build/all-restricter-checked.js ../build/all-restricter-checked-bootstrapped.js ; then
  echo "build-restricter.sh: error building all-restricter-checked-bootstrapped.js"
  echo "build-restricter.sh: (should be identical to all-restricter-checked.js)"
  exit 1
fi
