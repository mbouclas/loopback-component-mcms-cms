module.exports = (function(App,Package,privateMethods){
  var lo = require('lodash'),
    async = require('async');

  return function (filters,options,callback) {
    if (arguments.length == 2){
      var callback = arguments[1],
        options = {};
    } else if (arguments.length == 1){
      var callback = arguments[0],
        options = {};
    }

    //build queries for both models & aggregations
    var loopbackQuery = privateMethods.queryBuilder.loopback(filters),
      aggregationsQuery = privateMethods.queryBuilder.aggregations(filters);
    // loopbackQuery.skip = 10;
    // console.log(JSON.stringify(loopbackQuery))
    // console.log(JSON.stringify(aggregationsQuery))
    var asyncTasks = {
        pages : fetchPages.bind(null,loopbackQuery)
      },
      Category = {},
      Collection = App.models.Page.getDataSource().connector.collection(App.models.Page.modelName);

    if (options.aggregations){
      var aggregationsToRun = runAggregations(options.aggregations);
      for (var i in aggregationsToRun){
        asyncTasks['aggregation-' + i] = aggregationsToRun[i].bind(null,Collection,aggregationsQuery)
      }
    }

    async.parallel(asyncTasks,callback);


    function fetchPages(query,next) {

      App.Services['mcmsNodeCMS'].Page.find(query, lo.merge({relatedSkus: true},options), next);
    }

    function runAggregations(requestedAggregations) {
      var tasks = {
        extraFields : 'aggregateResultsToExtraFields',
        prices : 'aggregateResultsToGetPrices',
        categories : 'aggregateResultsToCategories'
      },
        aggregationsToRun = {};

      for (var i in requestedAggregations){
        aggregationsToRun[requestedAggregations[i]] = privateMethods[tasks[options.aggregations[i]]];
      }

      return aggregationsToRun;
    }

  }

});
