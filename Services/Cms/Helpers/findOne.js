module.exports = (function (App, Package, privateMethods) {
  var lo = require('lodash'),
    async = require('async'),
    Model = {};

  /**
   * query MUST be an object of type {permalink|id... :val} OR {where :{},limit....}
   */
  return function (query, options, callback) {
    if (arguments.length == 2) {
      var callback = arguments[1],
        options = {};
    } else if (arguments.length == 1) {
      var callback = arguments[0],
        options = {};
    }

    Model = App.models.Product;
    var Query = App.Helpers.loopback.setUpFilters(query);

    var asyncTasks = [
      fetch
    ];

    if (typeof options.relatedSkus != 'undefined' || options.relatedSkus == 'undefined') {
      asyncTasks.push(fetchRelatedSkus);
    }

    async.waterfall(asyncTasks, callback);

    function fetch(next) {
      Model.findOne(Query).then(function (doc) {
        if (!doc){
          next('Product.findOne.ProductNotFound');
        }
        next(null,privateMethods.formatItem(doc,options));
      })
        .catch(function (err) {
          next(err);
        });
    }

    function fetchRelatedSkus(model, next) {
      var q = {where: {active: true, baseSku: model.baseSku}};
      if (options.relatedSkus == 'full') {
        q.include = ['ExtraFields', 'Categories'];
      }

      App.models.Product.find(q)
        .then(function (related) {
          var items = [];
          for (var i in related){
            items.push(privateMethods.formatItem(related[i]));
          }
          model.relatedSkus = items;
          model.relatedSkus.splice(lo.findIndex(model.relatedSkus,{id : model.id}),1);
          related = null;
          next(null, model);
        })
        .catch(function (err) {
          next(err);
        });



    }


  }
});
