(function () {
  'use strict';

  angular.module('mcms.cms.pages', [
    'angular-sortable-view',
    'md.data.table'
  ]).run(run);

  run.$inject = ['mcms.widgetService'];

  function run(Widget) {
    var widgets = [
      Widget.newWidget(
        {
          title: 'Latest Pages',
          template: ' <latest-pages-widget></latest-pages-widget>',
          settings: {
            perPage: 10
          }
        }
      )
    ];

    Widget.registerWidgets(widgets);
  }

})();


require('./routes');
require('./services');
require('./PagesHomeController');
require('./PageController');
require('./page-list.component');
require('./editPage.component');
require('./quickEditPage.component');
require('./latestPages.widget');
require('./quickFindPage.component');



