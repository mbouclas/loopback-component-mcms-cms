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
