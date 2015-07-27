var result = XBBCODE.process({
  text: narrative
});

console.log("Errors: " + result.error);
console.dir(result.errorQueue);
console.log(result.html);// the HTML form of your BBCode

// if bbcode is not used in the narrative, omit the first character,
// which will be used as the drop-cap

if (result.html[0] === '<' || result.html[0] === '['){
  document.getElementById("xbbcode").innerHTML =  result.html;
} else {
  document.getElementById("xbbcode").innerHTML =  result.html.substr(1)
}
