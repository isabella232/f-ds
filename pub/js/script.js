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

// confirm password for change password

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
