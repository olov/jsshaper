jQuery(document).ready(function() {
    // run restricter
    jQuery("form").submit(function() {
        jQuery("#results").empty();
        return false;
    });
    // act on keystrokes in editor
    jQuery("#code").keydown(function(e) {
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
            else if (e.keyCode == 27) { // ESC
                var source = jQuery("#code").val();
                jQuery("#pre").html(source).chili().show();
                return false;
            }
        }
    });

    // hide highlighter, show editor
    jQuery("#pre").dblclick(function(){
        jQuery("#pre").hide();
        jQuery("#code").focus();
    });
});
