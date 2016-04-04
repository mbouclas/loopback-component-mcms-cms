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
