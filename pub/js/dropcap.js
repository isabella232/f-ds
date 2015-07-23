// Drop cap settings

var dropcap = document.querySelector("#drop-cap");
// media query event handler
if (matchMedia) {
  var mq = window.matchMedia("(min-width: 768px)");
  mq.addListener(WidthChange);
  WidthChange(mq);
}
// media query change
function WidthChange(mq) {
  if (mq.matches) {
    // if window width is at least 768px, the drop cap spans the height of 3 lines
    window.Dropcap.layout(dropcap, 3);
  }
  else {
    // if window width is less than 768px, the drop cap spans the height of 2 lines
    window.Dropcap.layout(dropcap, 2);
  }
}
