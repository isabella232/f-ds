'use strict';

var close = document.getElementById('cta-close')
var cta = document.getElementsByClassName('cta')[0]

if (close && cta) {
  close.onclick = function() {
    cta.style.transform = "translate(-700px, 0px)"
    setTimeout(function () { cta.style.display = "none" }, 600)
  }
}
