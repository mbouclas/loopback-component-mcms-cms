module.exports = (function(App,Package,privateMethods) {
  var lo = require('lodash'),
    async = require('async');

  return function (item, options) {
    var sanitizedItem = privateMethods.prepareItemForSaving(item);

    if (item.id){
      //update
      return App.models.Product.findById(item.id).then(function (model) {
        delete sanitizedItem.id;
        return model.updateAttributes(sanitizedItem);
      });
    }

    //create
    delete sanitizedItem.id;
    return App.models.Product.create(sanitizedItem);
  }
});
