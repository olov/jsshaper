// global on purpose so they can be retrieved easily from the JS console
var Shaper = requirejs('shaper');
var Assert = requirejs('assert');
var pipeline = ["annotater", "asserter", "restricter"];

jQuery(document).ready(function($) {
    var source = "";
    var checked = null;
    function showSourceview() {
        $("#sourceedit").hide();
        source = $("#sourceedit").val();
        $("#sourceview").html(source).chili().show();
    }

    function formatException(e) {
        var reason = String(e);
        if (e.stack === undefined) { // no stack-trace
            return reason;
        }
        if (e.stack.indexOf(reason) === 0) { // stack-trace is good as-is
            return e.stack;
        }
        else { // concatenate reason and stack-trace
            return reason + "\n" + e.stack;
        }
    }

    function shape() {
        source = $("#sourceedit").val();
        try {
            checked = null;
            clear();
            var root = Shaper.parseScript(source, "try.js");
            root = Shaper.run(root, pipeline);
            checked = root.getSrc();
            $("#checkedview").html(checked).chili();
            $("#checkedview").css("background", "white");
            $("#output").css("border-color", "grey");
        }
        catch (e) {
            print(e);
            $("#checkedview").css("background", "#eee");
            $("#output").css("border-color", "red");
        }
    }

    function exec(src) {
        try {
            var fn = new Function(src);
            fn();
        }
        catch (e) {
            print(formatException(e));
        }
    }
    $("#execleft").click(function() {
        $("#output").text("Running original (left) program:\n");
        setTimeout(function() {
            exec(source);
        }, 0);
    });
    $("#execright").click(function() {
        shape();
        if (checked === null) {
            return;
        }
        $("#output").text("Running checked (right) program:\n");
        setTimeout(function() {
            exec(checked);
        }, 0);
    });


    // act on keystrokes in editor
    $("#sourceedit").keydown(function(e) {
        setTimeout(shape, 50);

        // code borrowed from John Resig
        if (this.setSelectionRange) {
            var start = this.selectionStart;
            var val = this.value;

            // enter
            if (e.keyCode === 13) {
                var match = val.substring(0, start).match(/(^|\n)([ \t]*)([^\n]*)$/);
                if (match) {
                    var spaces = match[2];
                    var length = spaces.length + 1;
                    this.value = val.substring(0, start) +"\n"+ spaces + val.substr(this.selectionEnd);
                    this.setSelectionRange(start + length, start + length);
                    this.focus();
                    return false;
                }
            }
            // backspace
            else if (e.keyCode === 8 && val.substring(start - 2, start) === "  ") {
                this.value = val.substring(0, start - 2) + val.substr(this.selectionEnd);
                this.setSelectionRange(start - 2, start - 2);
                this.focus();
                return false;
            }
            // tab
            else if (e.keyCode === 9) {
                this.value = val.substring(0, start) +"  "+ val.substr(this.selectionEnd);
                this.setSelectionRange(start + 2, start + 2);
                this.focus();
                return false;
            }
            // escape
            else if (e.keyCode === 27) {
                showSourceview();
                return false;
            }
        }
    });

    // hide highlighter, show editor
    $("#sourceview").click(function(){
        $("#sourceview").hide();
        $("#sourceedit").show().focus();
    });

    var sourceedit = [
        '// click to edit, ESC to leave',
        '"use strict"; "use restrict";',
        '',
        'function average(x, y) {',
        '  return (x + y) / 2;',
        '}',
        '// 1.5, as expected',
        'print(average(1, 2));',
        '',
        '// 6 (since 1+"2" === "12" and "12"/2 === 6)',
        '// in restrict mode this throws an exception',
        '// which helps you spot the defect',
        'print(average(1, "2"));'
    ].join("\n");

    $("#sourceedit").html(sourceedit);
    showSourceview();
    shape();
});

function print(str) {
    var old = $("#output").text();
    $("#output").text(old + str + "\n");
}
function clear() {
    $("#output").text("");
}
