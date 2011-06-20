"use strict"; "use restrict";

var Shaper = Shaper || require("shaper.js") || Shaper;
var Ref = Ref || require("ref.js") || Ref;
var Assert = Assert || require("assert.js") || Assert;
var Fmt = Fmt || require("fmt.js") || Fmt;

Shaper("var-splitter", function(root) {
    var varTempl = Shaper.parse("var $, $$");
    var semiTempl = Shaper.parse("var $, $$;");
    var forTempl = Shaper.parse("for (var $, $$; $; $) $");

    // VAR node has at least two children
    // keep the first child in the existing VAR node,
    // create new VAR nodes for the rest
    function alter(node, ref) {
        var sequenceProperty = ref.properties[0];
        var sequenceIndex = Number(ref.properties[1]);
        // ref is not in a sequence so create a BLOCK
        if (isNaN(sequenceIndex)) {
            var block = Shaper.replace(ref.get().type === tkn.SEMICOLON ?
                                       "{ $ }" : "{ $; }", ref.get());
            ref.set(block);
            alter(block.children[0].expression, new Ref(block, "children", 0));
            return;
        }
        var rest = node.children.slice(1);

        for (var i = 0; i < rest.length; i++) {
            var varNode = Shaper.replace("var $;", rest[i]);
            Shaper.insertAfter(new Ref(ref.base, sequenceProperty, sequenceIndex++), varNode);
            Shaper.remove(new Ref(node, "children", 1));
        }
    }
    return Shaper.traverse(root, {pre: function(node, ref) {
        if (Shaper.match(forTempl, node)) {
            // create new FOR node without setup
            var repl = Shaper.parse(Fmt("for (;{0};{1}) $",
                                        node.condition ? "$" : "",
                                        node.update ? "$" : ""));
            node.condition && (repl.condition = node.condition);
            node.update && (repl.update = node.update);
            repl.body = node.body;
            Shaper.cloneComments(repl, node);
            ref.set(repl);

            // Prepend FOR node with the VAR setup embedded in a SEMICOLON node
            var semi = Shaper.replace("$;", node.setup);
            Shaper.insertBefore(ref, semi);

            // Split the VARs
            alter(semi.expression, ref); // ref points to semi now because of insert
            return repl;
        }
        else if (Shaper.match(semiTempl, node)) {
            alter(node.expression, ref);
        }
        else if (Shaper.match(varTempl, node)) {
            alter(node, ref);
        }
    }});
});
