"use strict"; "use restrict";

var Shaper = Shaper || require("../shaper.js") || Shaper;
var Comments = Comments || require("../comments.js") || Comments;

Shaper("annotater", function(root) {
    Shaper.traverse(root, {pre: function(node, ref) {
        // collect leading comments (whitespace excluded)
        var comments = [];
        var split = Comments.split(node.leadingComment);
        for (var i = 0; i < split.length; i++) {
            var str = split[i];
            if (Comments.isComment(str)) {
                comments.push(str);
            }
            else if (!Comments.isBlankString(str)) {
                break;
            }
        }

        // match comments with annotater matchers
        for (i = 0; i < Annotater.matchers.length; i++) {
            var matcher = Annotater.matchers[i];

            for (var j = 0; j < comments.length; j++) {
                var comment = comments[j];

                var annotation = comment.match(matcher.re);
                if (annotation === null) {
                    continue;
                }
                var fn = matcher.applyfn;
                fn(node, annotation);
            }
        }
    }});
});

function Annotater(re, applyfn) {
    Annotater.matchers.push({re: re, applyfn: applyfn});
}
Annotater.matchers = [];

if (typeof exports !== "undefined") {
    module.exports = Annotater;
}
