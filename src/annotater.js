"use strict"; "use restrict";

var load, require = require || load;
var Shaper = Shaper || require("./shaper.js") || Shaper;

Shaper("annotater", function(root) {
    var annotations = [];
    function pushNodeFragment(node, frag) {
        // remove to-end-of-line comments (// comment)
        frag = frag.replace(/\/\/.*/g, "");

        // skip if frag doesn't contain anything but whitespace
        if (frag.search(/\S/) === -1) {
            return;
        }
        // apply annotations captured on previous node fragment to this node
        if (annotations.length > 0) {
            applyAnnotations(node);
            return;
        }

        var isTerminalNode = (node.srcs.length === 1);
        captureAnnotation(node, frag, isTerminalNode);

        // special-case for terminal node, for example where fragment is
        // (/*loose*/ x), (/*loose*/ (x)) or {/*loose*/}
        // in this case the annotations should be applied to the same node
        // for which it was captured, not next node
        if (annotations.length > 0 && isTerminalNode) {
            applyAnnotations(node);
        }
    }
    function captureAnnotation(node, frag, allowTrailing) {
        for (var i = 0; i < annotate.matchers.length; i++) {
            var match = frag.match(annotate.matchers[i].re);
            if (match === null) {
                continue;
            }
            if (!allowTrailing) {
                var tail = frag.slice(match.index + match[0].length);
                // strip all /* inline */ comments [http://ostermiller.org/findcomment.html]
                tail = tail.replace(/\/\*([^*]|[\r\n]|(\*+([^*\/]|[\r\n])))*\*+\//g, "");

                // tail should only contain whitespace
                if (tail.search(/\S/) !== -1) {
                    error(node, "invalid annotation: "+ frag.slice(match.index));
                }
            }
            annotations.push({applyfn: annotate.matchers[i].applyfn, match: match});
        }
    }
    function applyAnnotations(node) {
        // todo annotations could be per-node, per-subtree or have a
        // custom, possibly tree-modifying, apply function
        // for now only per-node is implemented

        //print("applyAnnotations: "+ nodeString(node));
        for (var i = 0; i < annotations.length; i++) {
            var applyfn = annotations[i].applyfn;
            var match = annotations[i].match;
            applyfn(node, match);
        }
        annotations = [];
    }

    return Shaper.traverseTree(root, {
        pre: function(node, ref) {
            var parent = ref.base;
            if (parent) {
                pushNodeFragment(parent, parent.srcs[parent.nPushed++]);
            }
            node.nPushed = 0;
        },
        post: function(node, ref) {
            pushNodeFragment(node, node.srcs[node.nPushed++]);
            delete node.nPushed;
        }
    });
});

function Annotater(re, applyfn) {
    Annotater.matchers.push({re: re, applyfn: applyfn});
}
Annotater.matchers = [];

if (typeof exports !== "undefined") {
    module.exports = Annotater;
}
