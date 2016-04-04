(function () {
  angular.module('mcms.cms.pages')
    .directive('latestPages', latestPages);

  latestPages.$inject = ['CMS_CONFIG', '$log'];
  latestPagesController.$inject = ['$scope', 'Page'];

  function latestPages(Config, $log) {

    return {
      require: ['latestPages', '?ngModel'],
      templateUrl: Config.templatesDir + "Page/latestPages.widget.html",
      controller: latestPagesController,
      controllerAs: 'VM',
      scope: {
        options: '=?options'
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

  function latestPagesController($scope, Page) {
    var vm = this;
    vm.items = [];

    Page.find({filter : {where: {newImport : true}, limit: $scope.options}})
      .$promise
      .then(function (results) {
        vm.items = results;
      });
  }
})();
