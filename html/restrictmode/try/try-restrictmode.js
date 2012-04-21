var Shaper = requirejs('shaper');

jQuery(document).ready(function() {
    var source;
    var checked;
    function showSourceview() {
        jQuery("#sourceedit").hide();
        source = jQuery("#sourceedit").val();
        jQuery("#sourceview").html(source).chili().show();
    }

    // run restricter
    jQuery("form").submit(function() {
        clear();
        showSourceview();
        try {
            var root = Shaper.parseScript(source, "<filename>");
            root = Shaper.run(root, ["annotater", "restricter"]);
            checked = root.getSrc();
            jQuery("#checkedview").html(checked).chili().show();
        }
        catch (e) {
            var reason = String(e);
            if (e.stack) {
                reason += "\n\n"+ e.stack;
            }
            print(reason);
        }

        return false;
    });
    function exec(src) {
        clear();
        try {
            var fn = new Function(src);
            fn();
        }
        catch (e) {
            var reason = String(e);
            if (e.stack) {
                reason += "\n\n"+ e.stack;
            }
            print(reason);
        }
    }
    jQuery("#execleft").click(function() {
        exec(source);
    });
    jQuery("#execright").click(function() {
        exec(checked);
    });


    // act on keystrokes in editor
    jQuery("#sourceedit").keydown(function(e) {
        // code borrowed from John Resig
        if (this.setSelectionRange) {
            var start = this.selectionStart;
            var val = this.value;

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
            else if (e.keyCode === 8 && val.substring(start - 2, start) === "  ") {
                this.value = val.substring(0, start - 2) + val.substr(this.selectionEnd);
                this.setSelectionRange(start - 2, start - 2);
                this.focus();
                return false;
            }
            else if (e.keyCode === 9) {
                this.value = val.substring(0, start) +"  "+ val.substr(this.selectionEnd);
                this.setSelectionRange(start + 2, start + 2);
                this.focus();
                return false;
            }
            else if (e.keyCode === 27) { // ESC
                showSourceview();
                return false;
            }
        }
    });

    // hide highlighter, show editor
    jQuery("#sourceview").dblclick(function(){
        jQuery("#sourceview").hide();
        jQuery("#sourceedit").show();
        jQuery("#sourceedit").focus();
    });

    var sourceedit = [
        '// double-click to edit, ESC to leave',
        '"use restrict";',
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

    var checkedview = [
        '// press run restricter for',
        '// restricter output here'
    ].join("\n");

    jQuery("#sourceedit").html(sourceedit);
    showSourceview();
    jQuery("#checkedview").html(checkedview).chili().show();
});

function print(str) {
    $("#output").append(str + "\n");
}
function clear() {
    $("#output").html("").show();
}
