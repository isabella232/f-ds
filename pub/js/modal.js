// disable vote buttons if user is not logged in
// and display modal when a user who is not logged in clicks on vote buttons
var voteForm = document.getElementsByClassName('vote-section')[0]
var numOfAnswers = voteForm.getElementsByTagName('form').length
var overlay = document.getElementsByClassName('overlay')[0]
var buttons = []
var signupClose = document.getElementsByClassName('modal-close')[1]
var loginClose = document.getElementsByClassName('modal-close')[0]

// handle modal open
for (var i = 0; i < numOfAnswers ; i++) {

  buttons.push(voteForm.getElementsByTagName('button')[i])
  // disable vote buttons if user is not logged in
  user ? buttons[i].setAttribute('type', 'submit') : buttons[i].setAttribute('type', 'button')

  if (!user) {
    buttons[i].onclick = function() {
      overlay.style.display = 'block';
      document.getElementsByTagName('body')[0].style.overflow = "hidden"
    }
  }
}

// handle modal close
overlay.onclick = function(e) {
  if (e.target.className === 'overlay') {
    overlay.style.display = 'none';
    document.getElementsByTagName('body')[0].style.overflow = "auto"
  }
}
signupClose.onclick = function() {
  overlay.style.display = 'none';
  document.getElementsByTagName('body')[0].style.overflow = "auto"
}
loginClose.onclick = function() {
  overlay.style.display = 'none';
  document.getElementsByTagName('body')[0].style.overflow = "auto"
}
