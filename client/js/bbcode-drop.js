
'use strict';

var XBBCODE = require('../lib/bbcode/xbbcode')
var narrative = $('#xbbcode').text()

if (!narrative) { return }

// render bbcode
var result = XBBCODE.process({
  text: narrative
})

// preserve line breaks
result.html = result.html.replace(/^/gm, '<p>').replace(/$/gm, '</p>')

// inject bbcode
var xbbcode = document.getElementById("xbbcode")
xbbcode.innerHTML =  result.html;

/*COMMENTING OUT THIS CODE FOR CHANGE IN SITE STYLING
// find the first text node in xbbcode
var node = firstTextNode(xbbcode)

// check if the text node begins with a surrogate pair (composed of two bytes)
var surrogatePairs = node.textContent.match(/^[\uD800-\uDBFF][\uDC00-\uDFFF]/) || []
var firstCharLength = surrogatePairs.length === 0 ? 1 : surrogatePairs.length

// find the first character in the first textnode, which will be used as the drop cap
var firstChar = node.textContent.substr(0, firstCharLength)

// create the drop cap element and append it before the first text node
var newSpan = document.createElement('SPAN')
var newTextNode = document.createTextNode(firstChar)
newSpan.appendChild(newTextNode)
newSpan.id = 'drop-cap'
node.parentNode.insertBefore(newSpan, node)
newSpan.style.textTransform = 'uppercase'

// remove the first character used as the drop cap from the first text node
node.textContent = node.textContent.substr(firstCharLength)

// call the dropcap library and have the drop cap span the height of 3 lines
window.Dropcap.layout(document.querySelector("#drop-cap"), 3, 3);

function firstTextNode(node) {
  var textContent = node.textContent
  if (textContent.trim() === '') { return null }
  var children = node.childNodes
  // Text nodes have a text content and have no children.
  // Non-text nodes that have a textContent must have at least one descendant
  // that is a text node, so their child count would be > 0.
  if (children.length === 0) { return node }
  for (var i = 0; i < children.length; i++) {
    var child = firstTextNode(children[i])
    if (child) { return child }
  }
}

END OF MULTILINE COMMENT*/
