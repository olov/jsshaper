jQuery(document).ready(function() {
    var source;
    var checked;
    function showSourceview() {
        source = jQuery("#sourceedit").val();
        jQuery("#sourceview").html(source).chili().show();
    }

    // run restricter
    jQuery("form").submit(function() {
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
            jQuery("#output").html(reason).show();
        }

        return false;
    });
    function exec(src) {
        try {
            var fn = new Function(src);
            fn();
            jQuery("#output").html("No exception thrown").show();
        }
        catch (e) {
            var reason = String(e);
            if (e.stack) {
                reason += "\n\n"+ e.stack;
            }
            jQuery("#output").html(reason).show();
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
        jQuery("#sourceedit").focus();
    });

    var sourceedit = '"use restrict";\n\n// double-click to edit, ESC to leave\nvar x = 1 + "2";';
    jQuery("#sourceedit").html(sourceedit);
    showSourceview();
    jQuery("#checkedview").html("// press run restricter for\n// restricter output here").chili().show();
});
