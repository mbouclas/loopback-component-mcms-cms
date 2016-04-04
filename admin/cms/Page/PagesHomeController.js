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
