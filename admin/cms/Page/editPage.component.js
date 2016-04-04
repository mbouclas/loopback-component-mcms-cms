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
