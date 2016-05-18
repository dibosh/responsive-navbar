(function () {

  var viewLinkUpMapping = {
    'container': '#wrapper',
    'header': '.hugeinc-header',
    'content-area': '#main-content',
    'primary-nav': '.nav-items',
    'branding-block': '.branding',
    'slide-menu-close-button': '.close-button',
    'mobile-menu-button': '.mobile-menu',
    'mobile-slide-menu-overlay': '.mobile-slide-menu-overlay'
  };

  var previouslyOpenedSubNav = null;
  var previouslyActivatedNavLink = null;

  var container = null;
  var topHeader = null;
  var contentArea = null;
  var primaryNav = null;
  var primaryNavItemLinks = null; // Array of primary nav a tags, which will be used in mobile view
  var brandingBlock = null;
  var slideMenuCloseButton = null;
  var mobileMenuButton = null;
  var slideMenuContentOverlay = null; // This view is shown when the slider menu is visible to create a black overlay

  document.addEventListener('DOMContentLoaded', function () {
    hookupViewElements();
    getNavDataAsync('/api/nav.json', onAPICallback);
  }, false);

  // Get the element references that we will need to manipulate
  function hookupViewElements() {
    container = document.querySelector(viewLinkUpMapping['container']);
    topHeader = document.querySelector(viewLinkUpMapping['header']);
    contentArea = document.querySelector(viewLinkUpMapping['content-area']);
    primaryNav = document.querySelector(viewLinkUpMapping['primary-nav']);
    brandingBlock = document.querySelector(viewLinkUpMapping['branding-block']);
    slideMenuContentOverlay = document.querySelector(viewLinkUpMapping['mobile-slide-menu-overlay']);
    slideMenuCloseButton = document.querySelector(viewLinkUpMapping['slide-menu-close-button']);
    mobileMenuButton = document.querySelector(viewLinkUpMapping['mobile-menu-button']);

    slideMenuContentOverlay.onclick = function (event) {
      if(!isMobile()) {
        event.preventDefault();
        // Hide dropdows if they are shown
        hideSubNavDropdowns();
        // Hide this overlay
        showOverlayOnContent(false);
      } else {
        showMobileSlidingNav(false);
      }
    };

    mobileMenuButton.onclick = function (event) {
      showMobileSlidingNav(true);
    };

    slideMenuCloseButton.onclick = function (event) {
      showMobileSlidingNav(false);
    };

    adjustContentArea();
  }

  function showMobileSlidingNav(show) {
    if (show) {
      event.preventDefault();
      addClass(primaryNav, 'mobile-show');
      addClass(brandingBlock, 'show');
      addClass(slideMenuCloseButton, 'show');
      addClass(mobileMenuButton, 'hide');
      addClass(slideMenuContentOverlay, 'show');
    } else {
      event.preventDefault();
      removeClass(primaryNav, 'mobile-show');
      removeClass(brandingBlock, 'show');
      removeClass(slideMenuCloseButton, 'show');
      removeClass(mobileMenuButton, 'hide');
      removeClass(slideMenuContentOverlay, 'show');
    }
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

  // Gets called once nav item data is fetched from backend
  function onAPICallback(jsonData) {
    populateNavigationTree(jsonData);
    // Once generated, we need to keep a reference to all the nav item links for mobile view
    // and hook up event handlers
    primaryNavItemLinks = Array.prototype.filter.call(primaryNav.querySelectorAll('a'), function (element) {
      return element.className === 'nav-item-link';
    });
    primaryNavItemLinks.forEach(function (link) {
      link.onclick = onNavLinkClick;
    });

    // Check if the view is already mobile or not and take necessary steps
    if(isMobile()) {
      setupMobileSpecificStuffs();
    }

    window.onresize = function () {
      // Even if the browser is resized to mobile, the view setup should be done
      if(isMobile()) {
        setupMobileSpecificStuffs();
      }
      // Adjust content area based on window height
      adjustContentArea();
    };
  }

  // Sets up necessary stuffs for mobile view
  function setupMobileSpecificStuffs() {
    if (primaryNavItemLinks != null) {
      primaryNavItemLinks.forEach(function (link) {
        if (link.nextSibling != null && hasClass(link.nextSibling, 'sub-nav-items')) {
          addClass(link, 'expand');
        }
      });
    }

    if (primaryNav.querySelector('.copyright-item') === null) {
      var li = document.createElement('li');
      li.appendChild(document.createTextNode('© 2014 Huge. All Rights Reserved.'));
      addClass(li, 'copyright-item');

      primaryNav.appendChild(li);
    }
    // Close previously opened any sub nav
    hideSubNavDropdowns();
  }

  // Takes care of the fact that only one secondary nav should be shown at a time
  // and the overlay on content should not be visible when the nav is gone
  function hideSubNavDropdowns() {
    if (previouslyOpenedSubNav != null && hasClass(previouslyOpenedSubNav, 'show')) {
      removeClass(previouslyOpenedSubNav, 'show');
    }

    if (previouslyActivatedNavLink != null && hasClass(previouslyActivatedNavLink, 'nav-item-link-active')) {
      removeClass(previouslyActivatedNavLink, 'nav-item-link-active');
    }
  }

  function showOverlayOnContent(show) {
    if (show) {
      if (!hasClass(slideMenuContentOverlay, 'show')) {
        addClass(slideMenuContentOverlay, 'show');
      }
    } else {
      if (hasClass(slideMenuContentOverlay, 'show')) {
        removeClass(slideMenuContentOverlay, 'show');
      }
    }
  }

  // Factory method that creates a li node which can represent a nav(primary/secondary) item
  function getListItem(itemData, classNameMapping) {
    var li = document.createElement('li');
    li.id = getId(itemData.label, '-item');
    addClass(li, classNameMapping['li']);

    var a = document.createElement('a');
    a.id = getId(itemData.label, '-item-link');
    a.appendChild(document.createTextNode(itemData.label));
    a.href = itemData.url;
    addClass(a, classNameMapping['a']);

    li.appendChild(a);

    return li;
  }

  // Generalised click event handler for all primary nav items
  function onNavLinkClick(event) {
    if (isMobile()) {
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
    var subNav = document.getElementById(getId(srcNavItemPrefix, '-sub-nav-items'));

    if (subNav != null) {
      event.preventDefault();
      if (hasClass(subNav, 'show')) {
        // This subNav was previously shown, hide it
        hideSubNavDropdowns();
        if (!isMobile()) {
          showOverlayOnContent(false);
        }
      } else {
        // First hide any other subNav opened before
        hideSubNavDropdowns();
        // Now show this subNav
        addClass(subNav, 'show');
        addClass(event.target, 'nav-item-link-active');
        // Keep it for future reference
        previouslyActivatedNavLink = event.target;
        previouslyOpenedSubNav = subNav;
        // If the overlay is not shown yet, show it
        if (!isMobile()) {
          showOverlayOnContent(true);
        }
      }
    } else {
      // Clean up anyways
      hideSubNavDropdowns();
      if (!isMobile()) {
        showOverlayOnContent(false);
      }
    }
  }

  function populateNavigationTree(navData) {
    navData.items.forEach(function (singleNavItemData) {
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
        secondaryNav.id = getId(singleNavItemData.label, '-sub-nav-items');
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
  }

  function adjustContentArea() {
    contentArea.style.top = topHeader.offsetHeight + 'px';
    contentArea.style.height = (container.offsetHeight - topHeader.offsetHeight) + 'px';
  }
})();


