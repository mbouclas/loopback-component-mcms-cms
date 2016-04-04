(function () {
  angular.module('mcms.cms.pages')
    .directive('pageList', pageList);

  pageList.$inject = ['CMS_CONFIG', '$log'];
  pageListController.$inject = ['$scope', 'mcms.pagesService', '$mdSidenav', '$log', '$mdDialog','lodashFactory'];

  function pageList(Config, $log) {

    return {
      require: ['pageList', '?ngModel'],
      templateUrl: Config.templatesDir + "Page/page-list.component.html",
      controller: pageListController,
      controllerAs: 'VM',
      scope: {
        options: '=?options',
        filters : '=?filters'
      },
      transclude: {
        Header: '?listHeader'
      },
      restrict: 'E',
      link: function (scope, element, attrs, controllers) {
        var defaults = {
          hasFilters: true
        };

        if (!scope.options) {
          scope.options = {};
        }

        scope.Settings = angular.extend(defaults, scope.options);

      }
    };
  }

  function pageListController($scope, Page, $mdSidenav, $log, $mdDialog,lo) {
    var vm = this;
    vm.Pages = [];
    vm.Pagination = {limit: 12};
    vm.Counters = {};
    vm.selected = [];
    vm.filters = {
      active: null,
      sku: null,
      title: null,
      page: 1
    };
    vm.boolValues = [
      {
        label : 'Don\'t care',
        value : null
      },
      {
        label : 'Yes',
        value : true
      },
      {
        label : 'No',
        value : false
      }
    ];


    if ($scope.filters){
      vm.filters = angular.extend(vm.filters,$scope.filters);
    }

    filter();

    vm.filter = function (filter, value) {
      vm.filters[filter] = value;
    };

    vm.toggleFilters = function () {
      $mdSidenav('filters').toggle();
    };

    vm.closeFilters = function () {
      $mdSidenav('filters').close();
    };

    function filter() {
      return Page.get(vm.filters)
        .then(function (res) {
          $log.debug(res.results.Pages);
          vm.Pages = res.results.Pages;
          vm.Pagination = res.results.Pagination;
          vm.Counters = res.results.counters;
        });
    }

    vm.applyFilters = function () {
      filter();
    };

    vm.changePage = function (page, limit) {
      vm.filters.page = page;
      filter();
    };

    vm.onItemSaved = function (newItem) {
      //replace old item with new
      var oldItem = lo.findIndex(vm.Pages,{id : newItem.id});
      if (oldItem == -1){
        return;
      }
      vm.Pages[oldItem] = newItem;
    };

    vm.quickEdit = function (ev, item) {

      $mdDialog.show({
          controller: DialogController,
          template: '<md-dialog aria-label="Quick Edit">' +
          '<md-toolbar><div class="md-toolbar-tools"><h2>Quick edit</h2>' +
          '<div flex=""></div> ' +
          '<md-button class="md-icon-button" ng-click="close()">' +
          '<md-icon  class="material-icons">close</md-icon>' +
          '</md-button>' +
          ' </div></md-toolbar>' +
          '<md-dialog-content style="min-width: 600px;"><edit-page id="' + item.id + '" on-save="VM.onItemSaved(newItem)"></edit-page>' +
          '</md-dialog-content>' +
          '</md-dialog>',
          locals: {
            onItemSaved: vm.onItemSaved
          },
          bindToController: true,
          controllerAs : 'VM',
          parent: angular.element(document.body),
          targetEvent: ev,
          clickOutsideToClose: true,
          fullscreen: true
        })
        .then(function (answer) {
          $scope.status = 'You said the information was "' + answer + '".';
        }, function () {
          $scope.status = 'You cancelled the dialog.';
        });
    };

    function DialogController($scope, $mdDialog) {
      $scope.close = function () {
        $mdDialog.hide();
      };
    }

  }
})();
