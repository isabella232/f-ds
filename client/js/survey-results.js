'use strict';

// toggle display for vote and results section

var vote         = document.getElementsByClassName('vote-section')[0]
var results      = document.getElementsByClassName('results-section')[0]
var vote_btn     = document.getElementsByClassName('vote-btn')[0]
var results_btn  = document.getElementsByClassName('results-btn')[0]
var container    = document.getElementsByClassName('interactive-section')[0]
// display results section if userVote exists on question

function changeDisplay(el, val) {
  el.style.display = val
}

// on button click, toggle display for vote and results section
vote_btn.addEventListener("click", function() {
  setTimeout(function() {
    changeDisplay(vote, "block")
    changeDisplay(results, "none")
  }, 75)
  vote_btn.className = "vote-btn active"
  results_btn.className = "results-btn"
})
results_btn.addEventListener("click", function() {
  setTimeout(function() {
    changeDisplay(vote, "none")
    changeDisplay(results, "block")
  }, 75)
  vote_btn.className = "vote-btn"
  results_btn.className = "results-btn active"
})


if (userVote) {
  changeDisplay(vote, "none")
  changeDisplay(results, "block")
  vote_btn.className = "vote-btn"
  results_btn.className = "results-btn active"
} else {
  changeDisplay(vote, "block")
  changeDisplay(results, "none")
  vote_btn.className = "vote-btn active"
  results_btn.className = "results-btn"
}
