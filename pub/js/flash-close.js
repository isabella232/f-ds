// close flash message or error

if (document.getElementsByClassName('alert')[0]) {
  var alert = document.getElementsByClassName('alert')[0]
  var close = document.getElementById('alert-close')
  close.onclick = function() {
    alert.style.display = "none"
  }
}
