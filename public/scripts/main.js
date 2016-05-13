(function () {

  var viewLinkUpClassMapping = {
    'primary-nav': '.nav-items',
    'branding-block': '.branding',
    'slide-menu-close-button': '.close-button',
    'mobile-menu-button': '.mobile-menu'
  };
  var previouslyOpenedSubNav = null;
  var previouslyActivatedNavLink = null;
  var primaryNav = null;
  var primaryNavItemLinks = null; // Array of primary nav a tags, which will be used in mobile view
  var brandingBlock = null;
  var slideMenuCloseButton = null;
  var mobileMenuButton = null;

  document.addEventListener('DOMContentLoaded', function () {
    setupViewElems();
    getNavDataAsync('/api/nav.json', onAPICallback);
    // The mobile nav view has few view modifications that need to be done based on window size
    window.onresize = function () {
      if (window.innerWidth <= 786) {
        if (primaryNavItemLinks != null) {
          primaryNavItemLinks.forEach(function (link) {
            if (link.nextSibling != null && hasClass(link.nextSibling, 'sub-nav-items')) {
              addClass(link, 'expand');
            }
          });
        }
      }
    };

  }, false);

  // Takes care of the fact that only one secondary nav should be shown at a time
  function doUnnecessaryViewCleanup() {
    if (previouslyOpenedSubNav != null) {
      removeClass(previouslyOpenedSubNav, 'show');
    }

    if (previouslyActivatedNavLink != null) {
      removeClass(previouslyActivatedNavLink, 'nav-item-link-active');
    }
  }

  function _getId(prefix, suffix) {
    return (prefix + suffix).replace(/\s+/g, '-').toLowerCase();
  }

  // Factory method that creates a li node which can represent a nav(primary/secondary) item
  function getListItem(itemData, classNameMapping) {
    var li = document.createElement('li');
    li.id = _getId(itemData.label, '-item');
    addClass(li, classNameMapping['li']);

    var a = document.createElement('a');
    a.id = _getId(itemData.label, '-item-link');
    a.appendChild(document.createTextNode(itemData.label));
    a.href = itemData.url;
    addClass(a, classNameMapping['a']);
    a.addEventListener("click", onNavLinkClick);

    li.appendChild(a);

    return li;
  }

  // Generalised click event handler for all primary nav items
  function onNavLinkClick(event) {
    if (window.innerWidth <= 786) {
      // Mobile view
      // Toggle open-close icons
      if (hasClass(event.target, 'expand')) {
        removeClass(event.target, 'expand');
        addClass(event.target, 'collapse');
      } else if (hasClass(event.target, 'collapse')) {
        removeClass(event.target, 'collapse');
        addClass(event.target, 'expand');
      }
    }

    var srcElemID = event.target.id;
    var srcNavItemPrefix = srcElemID.substring(0, srcElemID.indexOf('-'));
    var subNav = document.getElementById(_getId(srcNavItemPrefix, '-sub-nav-items'));

    if (subNav != null) {
      if (hasClass(subNav, 'show')) {
        // Make sure if this same nav is clicked again, if it was showing secondary navs previously, it should
        // now close it
        doUnnecessaryViewCleanup();
      } else {
        // If previously some other secondary nav was made visible, now is the right time to close them off
        doUnnecessaryViewCleanup();
        addClass(subNav, 'show');
        addClass(event.target, 'nav-item-link-active');
        previouslyActivatedNavLink = event.target;
        previouslyOpenedSubNav = subNav;
      }
    }
  }

  // Gets called once nav item data is fetched from backend and so now, view needs to be populated
  function onAPICallback(jsonData) {
    jsonData.items.forEach(function (singleNavItemData) {
      var classNameMapping = {
        'li': 'nav-item',
        'a': 'nav-item-link'
      };

      var primaryNavItem = getListItem(singleNavItemData, classNameMapping);

      if (singleNavItemData.items.length > 0) {
        // Generate a secondary level of navigation
        var secondaryNav = document.createElement('ul');
        addClass(secondaryNav, 'sub-nav-items');

        // Create an unique id for the subitem list to identify later
        secondaryNav.id = _getId(singleNavItemData.label, '-sub-nav-items');
        singleNavItemData.items.forEach(function (singleSecondaryNavItemData) {
          var secondaryNavItemClassMapping = {
            'li': 'sub-nav-item',
            'a': 'sub-nav-item-link'
          };
          var secondaryNavItem = getListItem(singleSecondaryNavItemData, secondaryNavItemClassMapping);
          secondaryNav.appendChild(secondaryNavItem);
        });

        // Add secondary nav to primary nav
        primaryNavItem.appendChild(secondaryNav);

      }
      // Finally add the primary nav item to primary nav holder
      primaryNav.appendChild(primaryNavItem);
    });

    // Once generated, we need to keep a reference to all the nav item links for mobile view
    primaryNavItemLinks = Array.prototype.filter.call(primaryNav.querySelectorAll('a'), function (element) {
      return element.className === 'nav-item-link';
    });
  }

  // Get the views that we will need to manipulate
  function setupViewElems() {
    primaryNav = document.querySelector(viewLinkUpClassMapping['primary-nav']);
    brandingBlock = document.querySelector(viewLinkUpClassMapping['branding-block']);
    slideMenuCloseButton = document.querySelector(viewLinkUpClassMapping['slide-menu-close-button']);
    mobileMenuButton = document.querySelector(viewLinkUpClassMapping['mobile-menu-button']);

    mobileMenuButton.addEventListener('click', function (event) {
      event.preventDefault();
      addClass(primaryNav, 'mobile-show');
      addClass(brandingBlock, 'show');
      addClass(slideMenuCloseButton, 'show');
      addClass(mobileMenuButton, 'hide');
    });

    slideMenuCloseButton.addEventListener('click', function (event) {
      event.preventDefault();
      removeClass(primaryNav, 'mobile-show');
      removeClass(brandingBlock, 'show');
      removeClass(slideMenuCloseButton, 'show');
      removeClass(mobileMenuButton, 'hide');
    });
  }

  // Fetches the nav item data from node backend
  function getNavDataAsync(url, callback) {
    var xmlHttp = new XMLHttpRequest();
    xmlHttp.onreadystatechange = function () {
      if (xmlHttp.readyState == 4 && xmlHttp.status == 200)
        callback(JSON.parse(xmlHttp.responseText));
    };
    xmlHttp.open("GET", url, true);
    xmlHttp.send(null);
  }
})();


