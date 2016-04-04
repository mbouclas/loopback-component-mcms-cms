(function () {
  'use strict';

  angular.module('mcms.cms', [
    'mcms.cms.config',
    'mcms.cms.pages'
  ])
    .run(run);

  run.$inject = ['app.serviceProvider','mcms.menuService'];

  function run(App,Menu) {
    App.registerModule('registering cms module');
    var pagesMenu = Menu.newItem({
      id : 'products',
      title : 'Manage CMS',
      permalink : 'cms'
    });


/*    pagesMenu
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
    Menu.addMenu(pagesMenu);
  }

})();

require('./Config');
require('./routes');
require('./Page');

