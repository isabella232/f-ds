$(function() {
    // Replace all textarea's
    // with SCEditor
    $("textarea").sceditor({
        plugins: "bbcode",
        toolbar:"image,youtube|source",
        style: "minified/jquery.sceditor.square.min.css"
    });
});