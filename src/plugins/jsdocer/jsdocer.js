if (typeof define !== 'function') { var define = require('amdefine')(module); }

define(['../../shaper', '../../log', '../../fmt', '../annotater', '../../tkn'], function(Shaper, Log, Fmt, Annotater, tkn) {
"use strict"; "use restrict";

Shaper("jsdocer", function(root) {
    return Shaper.traverse(root, {pre: function(node, ref) {
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

    return Shaper.get("jsdocer");
});
