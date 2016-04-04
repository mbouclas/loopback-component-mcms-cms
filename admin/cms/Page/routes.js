(function () {
  'use strict';

  angular.module('mcms.cms.pages')
    .config(config);

  config.$inject = ['$routeProvider','CMS_CONFIG'];

  function config($routeProvider,Config) {

    $routeProvider
      .when('/cms', {
        templateUrl:  Config.templatesDir + 'Page/index.html',
        controller: 'PagesController',
        controllerAs: 'VM',
        reloadOnSearch : false,
        name: 'pages-home'
      })
      .when('/page/:id', {
        templateUrl:  Config.templatesDir + 'Page/page.html',
        controller: 'PageController',
        controllerAs: 'VM',
        reloadOnSearch : false,
        resolve: {
          item: ["mcms.pagesService",'$route', function (Page,$route) {
            return Page.resolvePage($route.current.params.id);
          }]
        },
        name: 'page'
      });

  }

})();

