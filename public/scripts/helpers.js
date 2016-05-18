function getId(prefix, suffix) {
  return (prefix + suffix).replace(/\s+/g, '-').toLowerCase();
}

function isMobile() {
  return window.innerWidth <= 786;
}

// Helper method to hide or show an element
function showElem(element, show) {
  var visibilityClass = show ? 'show' : 'hide';
  addClass(element, visibilityClass)
}

// Helper methods to easify class manipulations
function hasClass(el, className) {
  return el.classList ? el.classList.contains(className) :
    !!el.className.match(new RegExp('(\\s|^)' + className + '(\\s|$)'));
}

function addClass(el, className) {
  if (el.classList) {
    el.classList.add(className);
  } else if (!hasClass(el, className)) {
    el.className += " " + className;
  }
}

function removeClass(el, className) {
  if (el.classList) {
    el.classList.remove(className);
  } else if (hasClass(el, className)) {
    var reg = new RegExp('(\\s|^)' + className + '(\\s|$)');
    el.className = el.className.replace(reg, ' ');
  }
}