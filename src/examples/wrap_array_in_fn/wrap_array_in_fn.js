if (typeof define !== 'function') { var define = require('amdefine')(module); }

define(['../../shaper'], function(Shaper) {
"use strict"; "use restrict";

return Shaper("wrap_array_in_fn", function(root) {
    var templ = Shaper.parse("[$$]");
    return Shaper.traverse(root, {post: function(node, ref) {
        if (Shaper.match(templ, node)) {
            return ref.set(Shaper.replace(Shaper.parse("fn($)"), node));
        }
    }});
});

});
