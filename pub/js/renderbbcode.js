  var result = XBBCODE.process({
    text: narrative,
  });
  console.log("Errors: " + result.error);
  console.dir(result.errorQueue);
  console.log(result.html);// the HTML form of your BBCode
  document.getElementById("xbbcode").innerHTML =  result.html;