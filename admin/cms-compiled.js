(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
(function () {
  'use strict';

  var appUrl = 'cms/';
  var config = {
    templatesDir: appUrl + 'templates/',
    redactor : {
      wym : true,
      observeLinks : true,
      convertUrlLinks : true,
      plugins : ['fullscreen','fontsize','fontfamily','video','fontcolor'],
      removeEmpty : ['strong','em','p','span']
      //buttons : ['formatting', '|', 'bold', 'italic']
    }
  };
  angular.module('mcms.cms.config', [])
    .constant('CMS_CONFIG',config)
    .value('cms.config', config);

})();

},{}],2:[function(require,module,exports){
(function () {
  'use strict';

  angular.module('mcms.cms', [
    'mcms.cms.config'
  ])
    .run(run);

  run.$inject = ['app.serviceProvider','mcms.menuService'];

  function run(App,Menu) {
    App.registerModule('registering cms module');
    var eshopMenu = Menu.newItem({
      id : 'products',
      title : 'Manage CMS',
      permalink : 'cms'
    });


/*    eshopMenu
      .addChildren([
        {
          id : 'productCategories',
          title : 'Categories',
          permalink : 'products/categories'
        },
        {
          id : 'extraFields',
          title : 'Extra fields',
          permalink : 'products/extraFields'
        },
        {
          id : 'productSettings',
          title : 'Settings',
          permalink : 'products/settings'
        }
      ]);*/
    Menu.addMenu(eshopMenu);
  }

})();

require('./Config');
require('./routes');


},{"./Config":1,"./routes":3}],3:[function(require,module,exports){
(function () {
  'use strict';

  angular.module('mcms.cms')
    .config(config);

  config.$inject = ['$routeProvider','CMS_CONFIG'];

  function config($routeProvider,Config) {

  }

})();


},{}]},{},[2]);
