"use strict"; "use restrict";

var Comments = (function() {
    function split(str) {
        var i = 0;
        var len = str.length;
        var arr = [];

        function push(begin, end) {
            if (begin < end) {
                arr.push(str.slice(begin, end));
            }
        }

        while (i < len) {
            var frag = str.indexOf("/*", i);
            var line = str.indexOf("//", i);

            if (frag === -1 && line === -1) {
                // rest
                push(i, len);
                break;
            }
            else if (frag === -1 || (line !== -1 && line < frag)) {
                // line
                push(i, line);
                var lf = str.indexOf("\n", line + 2);
                if (lf === -1) {
                    lf = len - 1;
                }
                i = lf + 1;
                push(line, i);
            }
            else {
                // frag
                push(i, frag);
                var starslash = str.indexOf("*/", frag + 2);
                if (starslash === -1) {
                    throw new Error("split: /* and */ mismatch in "+ str);
                }
                i = starslash + 2;
                push(frag, i);
            }
        }

        if (arr.length === 0) {
            arr = [""];
        }
        return arr;
    }
    function trailing(arr) {
        if (arr.length === 0) {
            return arr;
        }
        var i = arr.length;
        while (--i >= 0 && (isComment(arr[i]) || isBlankString(arr[i]))) {
        }
        while (++i < arr.length && isBlankString(arr[i])) {
        }
        return [arr.slice(0, i).join(""), arr.slice(i).join("")];
    }
    function isBlankString(str) {
        return str.search(/\S/) === -1;
    }
    function isBlankChar(c) {
        return c === " " || c === "\t" || c === "\r" || c === "\n" ||
            c === "\f" || c === "\v";
    }
    function isComment(str) {
        // string begins with // or /*
        return str.search(/(^\/\/)|(^\/\*)/) === 0;
    }


    // Creates a comment-array with following indices for each comment:
    // comment = {
    //     prev: 8, // prev non-comment non-blank character
    //     start: 10,
    //     end: 18,
    //     next: 19 // next non-comment non-blank character
    // };
    function indexArray(src) {
        var splits = Comments.split(src);

        var comments = [];
        var i = 0;
        var pos = 0;

        while (i < splits.length) {
            // skip non-comment (if any)
            if (!isComment(splits[i])) {
                pos += splits[i].length;
                if (++i >= splits.length) {
                    break;
                }
            }

            var comment = {};

            // prev non-comment non-whitespace character + 1
            // (used to match with node.end's)
            comment.prev = pos;
            while (comment.prev > 0 && isBlankChar(src[comment.prev - 1])) {
                --comment.prev;
            }

            comment.start = pos;

            // skip until first text
            // (skip //, /**/ and whitespace)
            do {
                pos += splits[i].length;
            } while (++i < splits.length && (isComment(splits[i]) || isBlankString(splits[i])));

            // next non-comment non-whitespace character + 1
            // (used to match with node.start's)
            comment.next = comment.end = pos;
            while (comment.next < src.length && isBlankChar(src[comment.next])) {
                ++comment.next;
            }
            comments.push(comment);
        }

        return comments;
    }

    return {
        split: split,
        trailing: trailing,
        isBlankString: isBlankString,
        isComment: isComment,
        indexArray: indexArray
    };
})();

if (typeof exports !== "undefined") {
    module.exports = Comments;
}
