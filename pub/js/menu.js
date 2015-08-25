var menuBtn        = document.getElementsByClassName('ion-person')[0]
var desktopMenu    = document.getElementsByClassName('profile-menu-desktop')[0]
var mobileMenu     = document.getElementsByClassName('profile-menu-mobile')[0]
// handle menu open
menuBtn.onclick = function() {
  if (desktopMenu.className === "profile-menu-desktop") {
    desktopMenu.style.display = "block"
    desktopMenu.className = "profile-menu-desktop open"
    mobileMenu.style.display = "block"
    mobileMenu.className = "profile-menu-mobile open"
  } else {
    desktopMenu.style.display = "none"
    desktopMenu.className = "profile-menu-desktop"
    mobileMenu.style.display = "none"
    mobileMenu.className = "profile-menu-mobile"
  }
}
// handle menu close
document.onclick = function(e) {
  if (desktopMenu.className === "profile-menu-desktop open") {
    if (e.target.tagName != "LI" && e.target.className != "ion-person") {
      desktopMenu.style.display = "none"
      desktopMenu.className = "profile-menu-desktop"
      mobileMenu.style.display = "none"
      mobileMenu.className = "profile-menu-mobile"
    }
  }
}
