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

