var menuBtn = document.getElementsByClassName('ion-drag')[0]
var menu    = document.getElementById('menu')
menuBtn.onclick = function() {
  if (menu.className === "") {
    menu.style.display = "block"
    menu.className = "open"
  } else {
    menu.style.display = "none"
    menu.className = ""
  }
} 