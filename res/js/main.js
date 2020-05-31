console.log('main js loaded');

var collection = [];

function fixit() {
  if (collection.length != 0)
    return;

  var supplydrop = document.getElementById('supplydrop');
  supplydrop.classList.add('swing-animation');
  supplydrop.style.top = '21.3%';
  setTimeout(function() { // on animation end
    supplydrop.style.cursor = 'pointer';
    supplydrop.onclick = function () {
      var crateOpenOverlay = document.getElementById('crate-open-overlay');
      crateOpenOverlay.classList.add('fade-in');
      crateOpenOverlay.style.display = 'flex';
      crateOpenOverlay.style.opacity = 0.9;
      
      supplydrop.classList.add('fade-out');
      setTimeout(function() {
        supplydrop.parentNode.removeChild(supplydrop);
      }, 999);
    }
  }, 4000);

  var nothemes = document.getElementById('nothemes');
  nothemes.classList.add('fade-out');
  setTimeout(function() {
    nothemes.parentNode.removeChild(nothemes);
  }, 999);
}
