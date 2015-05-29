// Keeps title on landing page centered at all times

$(document).ready(function(){

 $("#login-btn").click(function() {
  $("#login-form").submit();
 });

 $("#signup-btn").click(function() {
  $("#signup-form").submit();
 })

 $(window).resize(function(){

  $('.welcome-section').css({
   position:'absolute',
   top: ($(window).height()
     - $('.welcome-section').outerHeight())/2
  });

  // $('.login').css({
  //  position:'absolute',
  //  left: ($(window).width()
  //    - $('.section').outerWidth())/2,
  //  top: ($(window).height()
  //    - $('.section').outerHeight())/2
  // });

  // $('.signup').css({
  //  position:'absolute',
  //  left: ($(window).width()
  //    - $('.section').outerWidth())/2,
  //  top: ($(window).height()
  //    - $('.section').outerHeight())/2
  // });

 });

 // To initially run the function:
 $(window).resize();

});

