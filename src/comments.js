"use strict"; "use restrict";

var Comments = (function() {
    function split(str) {
        var arr = [];
        function push(begin, end) {
            if (begin < end) {
                arr.push(str.slice(begin, end));
            }
        }
        var NOTFOUND = Number.MAX_VALUE;
        function myIndexOf(str, match, pos) {
            var ret = str.indexOf(match, pos);
            return (ret === -1) ? NOTFOUND : ret;
        }

        var i = 0;
        var begin = 0;
        var len = str.length;
        while (i <= len) {
            var string = Math.min(myIndexOf(str, "'", i), myIndexOf(str, '"', i));
            var regexp = myIndexOf(str, "/", i);
            var frag = myIndexOf(str, "/*", i);
            var line = myIndexOf(str, "//", i);

            if (frag === NOTFOUND && line === NOTFOUND) {
                // no remaining comment, push rest
                push(begin, len);
                break;
            }
            else if (string < frag && string < line && string < regexp) {
                // string found before /*, // or regexp
                // ffwd to matching un-escaped ' or "
                var singlequote = str[string] === "'"; // true if ', false if "
                while (string < len) {
                    string = myIndexOf(str, singlequote ? "'" : '"', string + 1);
                    if (str[string - 1] !== "\\" || str[string - 2] === "\\") {
                        break;
                    }
                }
                i = string + 1;
                continue;
            }
            else if (regexp < frag && regexp < line && regexp < string) {
                // regexp found before /*, // or string
                // ffwd to matching un-escaped /
                while (regexp < len) {
                    regexp = myIndexOf(str, "/", regexp + 1);
                    if (str[regexp - 1] !== "\\" || str[regexp - 2] === "\\") {
                        break;
                    }
                }
                i = regexp + 1;
                continue;
            }
            else if (line < frag) {
                // line
                push(begin, line);
                var lf = str.indexOf("\n", line + 2);
                if (lf === -1) {
                    lf = len - 1;
                }
                i = begin = lf + 1;
                push(line, i);
            }
            else {
                // frag
                push(begin, frag);
                var starslash = str.indexOf("*/", frag + 2);
                if (starslash === -1) {
                    throw new Error("split: /* and */ mismatch in "+ str);
                }
                i = begin = starslash + 2;
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
    function indexArray(src, commentIndices) {
        var splits = [];
        var pos = 0;
        var i;
        for (i = 0; i < commentIndices.length; i++) {
            if (commentIndices[i].start !== 0) {
                splits.push(src.slice(pos, commentIndices[i].start));
            }
            splits.push(src.slice(commentIndices[i].start, commentIndices[i].end));
            pos = commentIndices[i].end;
        }
        if (pos < src.length) {
            splits.push(src.slice(pos, src.length));
        }

        var comments = [];
        i = 0;
        pos = 0;

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
