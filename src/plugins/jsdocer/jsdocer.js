"use strict"; "use restrict";

var Annotater = Annotater || require("../annotater.js") || Annotater;
var Shaper = Shaper || require("../../shaper.js") || Shaper;
var Log = Log || require("../../log.js") || Log;
var Fmt = Fmt || require("../../fmt.js") || Fmt;

Shaper("jsdocer", function(root) {
    return Shaper.traverseTree(root, {pre: function(node, ref) {
        if (node.type === tkn.FUNCTION) {
            Log("function {0} with params {1}", node.name, node.params);
            node.body.varDecls.forEach(function(identifier) {
                Log("{0}~{1}", node.name, identifier.value);
            });
        }
    }});
});

// uses annotater so don't forget to add it to the pipeline, i.e.
//   plugins/annotater.js plugins/jsdocer/jsdocer.js
// note that the annotater plugin will execute before jsdocer above
Annotater(/\/\*\*[\s\S]*\*\//, function(node, match) {
    // a jsdoc annotation such as
    // /** @private */ this.radius = r;
    // is bound to the semicolon expression, however it
    // should apply to the assignment lvalue

    // move annotation from SEMICOLON to its expression, unconditionally
    if (node.type === tkn.SEMICOLON) {
        node = node.expression;
        if (node === undefined) {
            return;
        }
    }

    if (node.type === tkn.ASSIGN) {
        var lvalue = node.children[0];
        var rvalue = node.children[1];
        var assignOp = node.value;
        Log(node.verboseString());
        Log("Annotation for {0} {1} {2}\n{3}\n",
            lvalue.tknString(), assignOp, rvalue.tknString(), match);
    }
    else {
        Log("Annotation for {0}\n{1}\n", node.tknString(), match);
    }
});
