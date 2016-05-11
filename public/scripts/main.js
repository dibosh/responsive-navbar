(function () {
  var navBarClassName = '.nav-items';
  var previouslyOpenedSubNav = null;
  var previouslyActivatedNavLink = null;
  var primaryNav = null;

  document.addEventListener('DOMContentLoaded', function () {
    getAsync('/api/nav.json', onAPICallback);
  }, false);

  // Factory method that creates a li node which can represent a nav(primary/secondary) item
  function getListItem(itemData, classNameMapping) {
    var idPrefix = itemData.label.toLowerCase();
    var li = document.createElement('li');
    li.id = idPrefix + '-nav-item';
    li.className = classNameMapping['li'];

    var a = document.createElement('a');
    a.id = idPrefix + '-nav-item-link';
    a.appendChild(document.createTextNode(itemData.label));
    a.href = itemData.url;
    a.className = classNameMapping['a'];
    a.addEventListener("click", onNavLinkClick);

    li.appendChild(a);

    return li;
  }

  // This takes care of the fact that only one secondary nav should be shown at a time
  function doUnnecessaryViewCleanup() {
    if (previouslyOpenedSubNav != null && previouslyOpenedSubNav.className.indexOf('show') > -1) {
      previouslyOpenedSubNav.className = previouslyOpenedSubNav.className.replace(' show', '');
    }

    if (previouslyActivatedNavLink != null &&
      previouslyActivatedNavLink.className.indexOf('nav-item-link-active') > -1) {
      previouslyActivatedNavLink.className = previouslyActivatedNavLink.className.replace(' nav-item-link-active', '');
    }
  }


  // Generalised click event handler for all primary nav items
  function onNavLinkClick(event) {
    var srcElemID = event.target.id;
    var srcNavItemPrefix = srcElemID.substring(0, srcElemID.indexOf('-'));
    var subNav = document.getElementById(srcNavItemPrefix + '-sub-nav-items');
    if (subNav != null) {
      if (subNav.className.indexOf('show') > -1) {
        // Make sure if this same nav is clicked again, if it was showing secondary navs previously, it should
        // now close it
        doUnnecessaryViewCleanup();
      } else {
        // If previously some other secondary nav was made visible, now is the right time to close them off
        doUnnecessaryViewCleanup();
        subNav.className += ' show';
        event.target.className += ' nav-item-link-active';
        previouslyActivatedNavLink = event.target;
        previouslyOpenedSubNav = subNav;
      }
    }
  }

  // This gets called once nav item data is fetched from backend and so now, view needs to be populated
  function onAPICallback(jsonData) {
    primaryNav = document.querySelector(navBarClassName);

    setupMobileMenu();

    for (var i in jsonData.items) {
      var classNameMapping = {
        'li': 'nav-item',
        'a': 'nav-item-link'
      };

      var primaryNavItemData = jsonData.items[i];
      var primaryNavItem = getListItem(primaryNavItemData, classNameMapping);

      if (primaryNavItemData.items.length > 0) {
        // Generate a secondary level of navigation
        var secondaryNav = document.createElement('ul');
        secondaryNav.className = 'sub-nav-items';
        // Create an unique id for the subitem list to identify later
        secondaryNav.id = primaryNavItemData.label.toLowerCase() + '-sub-nav-items';
        for (var k in primaryNavItemData.items) {
          var secondaryNavItemData = primaryNavItemData.items[k];
          var secondaryNavItemClassMapping = {
            'li': 'sub-nav-item',
            'a': 'sub-nav-item-link'
          };
          var secondaryNavItem = getListItem(secondaryNavItemData, secondaryNavItemClassMapping);
          secondaryNav.appendChild(secondaryNavItem);
        }
        // Add secondary nav to primary nav
        primaryNavItem.appendChild(secondaryNav);

      }
      primaryNav.appendChild(primaryNavItem);
    }
  }

  // This sets up handler for mobile menu hamburger icon click
  function setupMobileMenu() {
    var mobileMenuButton = document.querySelector('.mobile-menu');
    mobileMenuButton.addEventListener('click', function (event) {
      event.preventDefault();
      primaryNav.className += ' mobile-show';
    });
  }

  // Fetches the nav item data from node backend
  function getAsync(url, callback) {
    var xmlHttp = new XMLHttpRequest();
    xmlHttp.onreadystatechange = function () {
      if (xmlHttp.readyState == 4 && xmlHttp.status == 200)
        callback(JSON.parse(xmlHttp.responseText));
    };
    xmlHttp.open("GET", url, true);
    xmlHttp.send(null);
  }
})();


