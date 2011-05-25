"use strict"; "use restrict";

var Shaper = Shaper || require("shaper.js") || Shaper;

Shaper("var-splitter", function(root) {
    var templ = Shaper.parse("var $, $$");
    return Shaper.traverse(root, {pre: function(node, ref) {
        if (Shaper.match(templ, node)) {
            // VAR node has at least two children
            // keep the first child in the existing VAR node,
            // create new VAR nodes for the rest
            var insertIndex = Number(ref.properties[1]); // ref.properties: ["children", index]
            var rest = node.children.slice(1);

            for (var i = 0; i < rest.length; i++) {
                var varNode = Shaper.replace("$;", Shaper.replace("var $", rest[i]));
                Shaper.insertAfter(new Ref(ref.base, "children", insertIndex++), varNode);
                Shaper.remove(new Ref(node, "children", 1));
            }
        }
    }});
});
