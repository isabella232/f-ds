// disable vote buttons if user is not logged in
// and display modal when a user who is not logged in clicks on vote buttons
var voteForm = document.getElementsByClassName('vote-section')[0]
var numOfAnswers = voteForm.getElementsByTagName('form').length
var overlay = document.getElementById('login-signup-overlay')
var loginClose = document.getElementById('login-close')
var signupClose = document.getElementById('signup-close')
var modalVoteClose = document.getElementById('modal-vote-close')
var body = document.getElementsByTagName('body')[0]
var buttons = []

// handle modal open
for (var i = 0; i < numOfAnswers ; i++) {

  buttons.push(voteForm.getElementsByTagName('button')[i])
  // disable vote buttons if user is not logged in
  user ? buttons[i].setAttribute('type', 'submit') : buttons[i].setAttribute('type', 'button')

  if (!user) {
    buttons[i].onclick = function() {
      overlay.style.display = 'block';
      body.style.overflow = "hidden"
    }
  }
}

// handle modal close
overlay.onclick = function(e) {
  if (e.target.className === 'overlay') {
    overlay.style.display = 'none';
    body.style.overflow = "auto";
  }
}
// signupClose.onclick = function() {
//   overlay.style.display = 'none';
//   body.style.overflow = "auto";
// }
// loginClose.onclick = function() {
//   overlay.style.display = 'none';
//   body.style.overflow = "auto";
// }

modalVoteClose.onclick = function() {
  overlay.style.display = 'none';
  body.style.overflow = "auto";
}
