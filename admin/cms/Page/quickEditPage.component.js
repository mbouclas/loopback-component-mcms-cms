(function () {
  angular.module('mcms.cms.pages')
    .directive('quickEditPage', quickEditPage);

  quickEditPage.$inject = ['CMS_CONFIG','$log'];
  quickEditPageController.$inject = ['$scope','mcms.pagesService','$mdSidenav','$log','$mdDialog'];

  function quickEditPage(Config,$log) {

    return {
      require: ['quickEditPage','?ngModel'],
      templateUrl: Config.templatesDir + "Page/quickEditPage.component.html",
      controller: quickEditPageController,
      controllerAs: 'VM',
      scope: {
        options : '=?options'
      },
      restrict: 'E',
      link: function (scope, element, attrs, controllers) {
        scope.productID = attrs.id;
      }
    };
  }

  function quickEditPageController($scope,Page,$mdSidenav,$log,$mdDialog) {
    var vm = this;


  }
})();
