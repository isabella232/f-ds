// confirm password for create account

function checkPass(){
  var pass1 = document.getElementById('password');
  var pass2 = document.getElementById('password2');

  if (pass1.value !== pass2.value){
    pass2.setCustomValidity("Passwords don't match");
  }
  else{
    pass2.setCustomValidity('');
  }
}


// changes modal links to static page links for screen widths under 480px

function setup_for_width(mql) {
  if (mql.matches) {
    $('#welcome-buttons > :nth-child(1)').attr('href', '#signup')
    $('#welcome-buttons > :nth-child(2)').attr('href', '#login')
  } else {
    $('#welcome-buttons > :nth-child(1)').attr('href', '/user/signupn')
    $('#welcome-buttons > :nth-child(2)').attr('href', '/user/login')
  }
}

var width_mql = window.matchMedia("(min-width: 480px)");
width_mql.addListener(setup_for_width);
setup_for_width(width_mql);
