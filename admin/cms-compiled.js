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
(function() {
    'use strict';

    angular.module('mcms.cms.pages')
        .controller('PageController',Controller);

    Controller.$inject = ['item'];

    function Controller(Item) {
        var vm = this;

      // $mdThemingProvider.theme('customTheme');
        vm.Item = Item;


    }

})();

},{}],3:[function(require,module,exports){
(function() {
    'use strict';

    angular.module('mcms.cms.pages')
        .controller('PagesController',Controller);

    Controller.$inject = ['$location','lodashFactory'];

    function Controller($location,lo) {
        var vm = this;
        var params = $location.search();

      try {
        vm.filters = (params.filters) ? angular.fromJson(params.filters) : {};
      }
      catch (e){
        vm.filters = {};
      }


    }

})();

},{}],4:[function(require,module,exports){
(function () {
  angular.module('mcms.cms.pages')
    .directive('editPage', editPage);

  editPage.$inject = ['CMS_CONFIG', '$log'];
  editPageController.$inject = ['$scope', 'mcms.pagesService', '$log', '$mdDialog', 'lodashFactory',
    'PageCategory','core.services','configuration','$mdToast','CMS_CONFIG','tabs.selector','$timeout'];

  function editPage(Config, $log) {

    return {
      require: ['editPage', '?ngModel'],
      templateUrl: Config.templatesDir + "Page/editPage.component.html",
      controller: editPageController,
      controllerAs: 'VM',
      scope: {
        options: '=?options',
        product: '=?ngModel',
        onSave : '&?onSave'
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

        if (typeof scope.product != 'undefined' && typeof scope.product == 'object') {
          controllers[0].set(scope.product);
        }
        else if (typeof scope.product == 'undefined' && attrs.id) {
          controllers[0].get(attrs.id);
        }

        scope.redactorConfig = Config.redactor;
      }
    };
  }

  function editPageController($scope, Page, $log, $mdDialog, lo, Category,Core,Config,$mdToast,cmsConfig,TabSelector,$timeout) {
    var vm = this;
    vm.Page = {};
    vm.Categories = [];
    vm.tabs = [
      {
        label : 'General',
        file : cmsConfig.templatesDir + 'Page/tab-general-info.html',
        active : true,
        default : true,
        alias : 'general'
      },
      {
        label : 'Images',
        file : cmsConfig.templatesDir + 'Page/tab-images.html',
        active : false,
        default : false,
        alias : 'images'
      }
    ];
    var Tabs = new TabSelector('section',vm.tabs).set();
    vm.onTabChange = Tabs.change;
    vm.thumbUploadOptions = {
      uploadConfig : {
        url : Config.imageUploadUrl,
        fields : {
          container : 'Page',
          item : vm.Page
        }
      }
    };
    vm.selected = [];
    vm.imagesUploadOptions = {
      url : Config.imageUploadUrl,
      accept : Config.fileTypes.image.accept,
      acceptSelect : Config.fileTypes.image.acceptSelect,
      fields : {
        container : 'Page',
        item : {sku : vm.Page.sku }
      },
      uploadOptions : Config.fileTypes.image.uploadOptions
    };

    vm.onImagesUploadDone = function(file,response){

      if (typeof vm.Page.images == 'undefined'){
        vm.Page.images = [];
      }

      $timeout(function(){
        vm.Page.images.push(response);
      });
    };

    vm.deleteImage = function(image){
      vm.Page.images.splice(vm.Page.images.indexOf(image),1);
    };

    this.get = get;
    this.set = function (model) {
      vm.Page = model;
      vm.imagesUploadOptions.fields.item = {sku : vm.Page.sku };
      vm.thumbUploadOptions.uploadConfig.fields.item = {sku : vm.Page.sku };

    };

    vm.removeCategory = function (category) {
      vm.Page.categories.splice(vm.Page.categories.indexOf(category), 1);
      vm.Page.productCategoryIds.splice(vm.Page.productCategoryIds.indexOf(category.id), 1);
    };

    vm.getCategories = function (query) {
      if (Page.Categories.length > 0){
        return (!query) ? Page.Categories : Page.Categories.filter( Core.createFilterFor('category',query) );
      }

      return Category.find()
        .$promise
        .then(function (res) {
          vm.Categories = res;

          return (!query) ? res : res.filter( Core.createFilterFor('category',query) );
        });
    };

    vm.onCategorySelected = function (cat) {

      if (!cat || typeof cat.id == 'undefined'){
        return;
      }

      if (vm.Page.productCategoryIds.indexOf(cat.id) != -1){
        return;
      }

      vm.Page.categories.push(cat);
      vm.Page.productCategoryIds.push(cat.id);
      vm.searchText = null;
    };

    function get(productId) {
      var method = (Page.ExtraFields.length == 0 && Page.Categories.length == 0) ? 'resolvePage' : 'getOne';
      Page[method](productId).then(function (product) {
        vm.set(product);
      });
    }
    vm.save = function () {
      Page.save(vm.Page).then(function (result) {


        if (typeof $scope.onSave == 'function'){
          $scope.onSave({newItem : vm.Page});
        }

        $mdToast.show(
          $mdToast.simple()
            .textContent('saved!')
            .position('bottom right')
            .hideDelay(2000)
        );

        // Core.toastSuccess('Car model saved');
      }).catch(function(e){
        $mdToast.showSimple('Ooops, something went wrong!');
      });
    };


  }
})();

},{}],5:[function(require,module,exports){
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




},{"./PageController":2,"./PagesHomeController":3,"./editPage.component":4,"./latestPages.widget":6,"./page-list.component":7,"./quickEditPage.component":8,"./quickFindPage.component":9,"./routes":10,"./services":11}],6:[function(require,module,exports){
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

},{}],7:[function(require,module,exports){
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

},{}],8:[function(require,module,exports){
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

},{}],9:[function(require,module,exports){
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

},{}],10:[function(require,module,exports){
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


},{}],11:[function(require,module,exports){
(function () {
  'use strict';

  angular.module('mcms.cms.pages')
    .service('mcms.pagesService', Service);

  Service.$inject = ['Page', '$log', '$q', 'app.serviceProvider', 'ExtraField', 'PageCategory'];
  var componentName = 'pages';

  function Service(Page, $log, $q, ServiceProvider, ExtraField, PageCategory) {
    var _this = this;
    this.Categories = [];
    this.ExtraFields = [];
    this.get = get;
    this.getOne = getOne;
    this.resolvePage = resolvePage;
    this.resolveCategories = getCategories;
    this.resolveExtraFields = getExtraFields;
    this.save = save;

    function resolvePage(id) {
      var tasks = {
        product: getOne(id),
        extraFields: getExtraFields(),
        categories: getCategories()
      };

      return $q.all(tasks).then(function (results) {
        _this.Categories = results.categories;
        _this.ExtraFields = results.extraFields;
        return results.product;
      });
    }

    function get(filters) {
      return Page.findAll(filters)
        .$promise
        .catch(handleErr);
    }

    //used for edit, grab all stuff that are needed to edit an item
    function getOne(id) {
      return Page.getOne({id: id})
        .$promise
        .catch(handleErr);
    }


    function getExtraFields() {

      return ExtraField.find().$promise;
    }

    function getCategories() {
      return PageCategory.find().$promise;
    }


    function handleErr(err) {
      $log.error('Fetch pages Error: ', err);
    }

    function save(item) {
      return Page.saveItem({item : item }).$promise.catch(handleErr);
    }

  }//End constructor


})();

},{}],12:[function(require,module,exports){
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


},{"./Config":1,"./Page":5,"./routes":13}],13:[function(require,module,exports){
(function () {
  'use strict';

  angular.module('mcms.cms')
    .config(config);

  config.$inject = ['$routeProvider','CMS_CONFIG'];

  function config($routeProvider,Config) {

  }

})();


},{}]},{},[12]);
