$(function() {
    // Replace all textarea's
    // with SCEditor
    $("textarea").sceditor({
        plugins: 'bbcode',
        toolbar:'bold,italic,underline|size,color|bulletlist,orderedlist|quote,horizontalrule|image,youtube|source',
    });
});
