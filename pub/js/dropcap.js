// Drop cap implementation

var xbbcode = document.getElementById('xbbcode')

// if bbcode is not used in the narrative, implement the dropcap as follows
if ( xbbcode.innerHTML[0] != "<" && xbbcode.innerHTML[0] != "[" ){
  document.getElementsByClassName('definition')[0].childNodes[0].innerHTML = narrative.substr(0,1).toUpperCase()
  document.getElementsByClassName('definition')[0].childNodes[0].id = 'drop-cap'
} else if (xbbcode.innerHTML[0] === '<') { // otherwise, implement the dropcap with this hack
  // create new span element to store the dropcap and append to the beginning of xbbcode

  var newSpan = document.createElement('SPAN')
  var firstLetter = document.createTextNode(xbbcode.childNodes[0].textContent.substr(0,1).toUpperCase())
  newSpan.appendChild(firstLetter)
  newSpan.id = 'drop-cap'
  xbbcode.insertBefore(newSpan, xbbcode.childNodes[0])
  newSpan.style.textTransform = 'uppercase'
  // delete the leading character in the narrative used as the dropcap
  xbbcode.childNodes[1].textContent = xbbcode.childNodes[1].textContent.substr(1)
}

var dropcap = document.querySelector("#drop-cap");
// the dropcap spans the height of 3 lines
window.Dropcap.layout(dropcap, 3);

