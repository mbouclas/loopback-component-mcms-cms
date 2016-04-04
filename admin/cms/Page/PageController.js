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
