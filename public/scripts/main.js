(function () {
  var navBarClassName = '.hugeinc-navbar';

  document.addEventListener('DOMContentLoaded', function () {
    getAsync('/api/nav.json', onAPICallback);
  }, false);

  function onAPICallback(jsonData) {
    var navBar = document.querySelector(navBarClassName);
    for (var i in jsonData.items) {
      var navItem = jsonData.items[i];
      var li = document.createElement("li");
      var url = document.createElement("a");
      url.appendChild(document.createTextNode(navItem.label));
      url.href = navItem.url;
      li.appendChild(url);
      navBar.appendChild(li);
    }
  }

  function getAsync(url, callback) {
    var xmlHttp = new XMLHttpRequest();
    xmlHttp.onreadystatechange = function () {
      if (xmlHttp.readyState == 4 && xmlHttp.status == 200)
        callback(JSON.parse(xmlHttp.responseText));
    };
    xmlHttp.open("GET", url, true);
    xmlHttp.send(null);
  }
}) ();


