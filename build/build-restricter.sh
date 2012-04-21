#!/bin/sh
# should be run from jsshaper/src

# pick d8 or node
if test -z "$JS" ; then
  JS=d8
fi
if ! which $JS > /dev/null ; then
  JS=node
fi
if ! which $JS > /dev/null ; then
  echo "Can't find d8 or node on the path.  Please set JS to your JavaScript shell."
  exit 1
fi
# concatenate parts of narcissus into all-narcissus.js
node node_modules/r.js -o name=../build/almond.js include=plugins/restricter out=../build/all-restricter-eval.js baseUrl=. optimize=none
# de-eval-ify so it runs right in strict mode.
${JS} run-shaper.js ../build/all-restricter-eval.js plugins/deeval.js --source > ../build/all-restricter.js
# let restricter create a checked version of itself (all-restricter-checked.js)
${JS} run-restricter.js -- ../build/all-restricter.js > ../build/all-restricter-checked.js
# let restricter create a checked version of all-restricter-checked.js
#  (should be identical)
${JS} run-restricter.js -- ../build/all-restricter-checked.js > ../build/all-restricter-checked-repeated.js
diff -u ../build/all-restricter-checked.js ../build/all-restricter-checked-repeated.js

# let all-restricter-checked create a checked version of all-restricter
#  (should be identical apart from extra trailing newline due to print)
cat plugins/restricter/restrict-mode.js ../build/all-restricter-checked.js ../build/build-restricter-ceremony.js > ../build/all-build-restricter-ceremony.js
${JS} ../build/all-build-restricter-ceremony.js > ../build/all-restricter-checked-bootstrapped.js

diff -u ../build/all-restricter-checked.js ../build/all-restricter-checked-bootstrapped.js
