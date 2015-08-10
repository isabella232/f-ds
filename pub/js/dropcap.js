// Drop cap implementation

var xbbcode = document.getElementById('xbbcode')

// if bbcode is not used in the narrative, implement the dropcap as follows
if ( xbbcode.innerHTML[0] != "<" && xbbcode.innerHTML[0] != "[" ){
  document.getElementsByClassName('definition')[0].childNodes[0].innerHTML = narrative.substr(0,1).toUpperCase()
  document.getElementsByClassName('definition')[0].childNodes[0].id = 'drop-cap'
} else if (xbbcode.innerHTML[0] === '<') { // otherwise, implement the dropcap with this hack

  function isAlpha(xStr){
    var regEx = /^[a-zA-Z0-9\-]+$/;
    return xStr.match(regEx);
  }

  var firstLetter
  var firstTextBlock

  // Find the first child node in xbbcode with alphanumeric text
  for (var i = 0; i < xbbcode.childNodes.length; i++) {
    if ( isAlpha(xbbcode.childNodes[i].textContent.trim().substr(0,1)) ) {
      firstTextBlock = xbbcode.childNodes[i]
      firstLetter = xbbcode.childNodes[i].textContent.trim().substr(0,1).toUpperCase()
      break
    }
  }

  // create new span element to store the dropcap and append to the beginning of the first block of text
  var newSpan = document.createElement('SPAN')
  var firstLetterNode= document.createTextNode(firstLetter)
  newSpan.appendChild(firstLetterNode)
  newSpan.id = 'drop-cap'
  xbbcode.insertBefore(newSpan, firstTextBlock)
  newSpan.style.textTransform = 'uppercase'
  // delete the leading character in the narrative used as the dropcap
  firstTextBlock.textContent = firstTextBlock.textContent.substr(1)
}

var dropcap = document.querySelector("#drop-cap");
// the dropcap spans the height of 3 lines
window.Dropcap.layout(dropcap, 3);

