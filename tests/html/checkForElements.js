(function() {
  console.log("HTML elements:");

  if (document.getElementsByClassName('something').length === 1)
    console.log('something');

  if (document.getElementById("an-id-ftw"))
    console.log('div by id');

  if (document.getElementById("i_hate_templates_like_this"))
    console.log('template');
})();
