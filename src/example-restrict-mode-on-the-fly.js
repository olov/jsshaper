define(function() {
  "use strict";
  
  (function() {
    console.log("evaluating 1 + undefined, not using strict mode. watch the NaN.");
    console.log(1 + undefined); // NaN
  })();

  (function() {
    "use restrict";
    console.log("evaluating 1 + undefined, using strict mode. watch it fail fast!");
    console.log(1 + undefined); // BOOM!
  })();
});
