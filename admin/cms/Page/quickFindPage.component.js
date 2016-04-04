(function () {
  angular.module('mcms.cms.pages')
    .directive('quickFindPage', Directive);

  Directive.$inject = ['CMS_CONFIG'];
  DirectiveController.$inject = ['$scope', 'mcms.pagesService','$log'];

  function Directive(Config) {

    return {
      templateUrl: Config.templatesDir + "Page/quickFindPage.component.html",
      controller: DirectiveController,
      controllerAs: 'VM',
      scope: {
        options: '=?options',
        onFound: '&?onFound'
      },
      restrict: 'E',
      link: function (scope, element, attrs, controllers) {
        var defaults = {
          limit: 10
        };

        scope.options = (!scope.options) ? defaults : angular.extend(defaults, scope.options);
      }
    };
  }

  function DirectiveController($scope, Page,$log) {
    var vm = this;
    vm.items = [];
    vm.filters = {
      active: null,
      sku: null,
      title: null,
      page: 1
    };

    vm.search = function () {
      Page.get(vm.filters)
        .then(function (res) {
          vm.items = res.results.Pages;
          vm.Pagination = res.results.Pagination;
          vm.Counters = res.results.counters;
        });
    };

    vm.selectItem = function (item) {
      if (typeof $scope.onFound == 'function'){
        $scope.onFound({item : item});
      }
    };

  }
})();
