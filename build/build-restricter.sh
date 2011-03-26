#!/bin/sh
# concatenate parts of narcissus into all-narcissus.js
cat jsecma5.js narcissus/lib/jsdefs.js jsmods.js narcissus/lib/jslex.js narcissus/lib/jsparse.js > ../build/all-narcissus.js
# concatenate shaper and restricter into all-restricter.js
cat fmt.js ref.js comments.js shaper.js annotater.js plugins/restricter.js > ../build/all-restricter.js
# let restricter create a checked version of itself (all-restricter-checked.js)
d8 run-restricter.js -- ../build/all-restricter.js > ../build/all-restricter-checked.js
# let restricter create a checked version of all-restricter-checked.js
#  (should be identical)
d8 run-restricter.js -- ../build/all-restricter-checked.js > ../build/all-restricter-checked-repeated.js
# let all-restricter-checked create a checked version of all-restricter
#  (should be identical apart from extra trailing newline due to print)
d8 ../build/all-narcissus.js plugins/restricter/restrict-mode.js ../build/all-restricter-checked.js ../build/build-restricter-ceremony.js > ../build/all-restricter-checked-bootstrapped.js
