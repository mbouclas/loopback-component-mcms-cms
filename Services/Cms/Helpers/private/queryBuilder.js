module.exports = (function (App, Package) {
  var lo = require('lodash');
  return {
    loopback : buildLoopbackQuery,
    aggregations : buildMongoAggregationQuery
  };

  function buildLoopbackQuery(filters) {
    if (typeof filters.where == 'undefined'){
      filters.where = {};
    }

    var Query = {
      where: {
        active: (typeof filters.where.active != 'undefined') ? filters.where.active : true
      }
    };

    if (lo.isNull(Query.where.active)){
      delete Query.where.active;
    }

    if (filters.include){
      Query.include = filters.include;
    }

    if (typeof filters.where.newImport != 'undefined' && !lo.isNull(filters.where.newImport)){
      Query.where.newImport = (filters.where.newImport === 'true');
    }

    Query.skip = (filters.skip) ? filters.skip : 0;
    Query.limit = (filters.limit) ? filters.limit : App.Config.eshop.catalogue.resultsPerPage;
    Query.order =  (filters.order) ? filters.order.field + ' ' + filters.order.way : App.Config.eshop.catalogue.sortBy + ' ' + App.Config.eshop.catalogue.sortWay;

    if (filters.where.category){
      Query.where.productCategoryIds = {inq: [filters.where.category]};
    }

    if (filters.where.extraFieldValues && filters.where.extraFieldValues.length > 0){
      if (!Query.where.and){
        Query.where.and = [];
      }
      /*          and: [
       {and: [{"extraFieldValues.id": "5535627631efa0843554b0ea"}, {"extraFieldValues.value": "808080"}]},
       {and: [{"extraFieldValues.id": "5535627631efa0843554b0ec"}, {"extraFieldValues.value": "polye"}]},
       {and: [{"extraFieldValues.id": "5535627631efa0843554b0eb"}, {"extraFieldValues.value": "15"}]}
       ]*/
      for (var i in filters.where.extraFieldValues){
        Query.where.and.push({
          and: [{"extraFieldValues.id": filters.where.extraFieldValues[i].id}, {"extraFieldValues.value": filters.where.extraFieldValues[i].value}]
        });
      }
    }

    if (filters.where.sku){
      Query.where.sku = {regexp: "/" + filters.where.sku + "/i"};
    }

    if (filters.where.title){
      Query.where.title = {regexp: "/" + filters.where.title + "/i"};
    }

    if (typeof filters.where.active != 'undefined' && filters.where.active != null) {
      Query.where.active = filters.where.active;
    }

    if (lo.isNull(Query.where.active)){
      delete Query.where.active;
    }

    if (filters.where.term){
      //Add an or for SKU - title
      if (!Query.where.or){
        Query.where.or = [];
      }
      Query.where.or.push({title : {regexp: "/" + filters.where.term + "/i"}});
      Query.where.or.push({sku : {regexp: "/" + filters.where.term + "/i"}});
    }

    //add date range
    //date: {gt: new Date('2014-04-01T18:30:00.000Z')}

    //add price range
    if (filters.where.price){
      if (!Query.where.and){
        Query.where.and = [];
      }
      var priceRange = [];
      if (filters.where.price.from) {
        priceRange.push({"eshop.price" : {gt : parseInt(filters.where.price.from)}});
      }

      if (filters.where.price.to) {
        priceRange.push({"eshop.price" : {lt : parseInt(filters.where.price.to)}});
      }

      Query.where.and.push({
        and :priceRange
      });
    }

    //add possible tags

    return Query;
  }

  function buildMongoAggregationQuery(filters) {
    var Query = {
      $match: {
        active: (typeof filters.where.active != 'undefined') ? filters.where.active : true
      }
    };

    if (typeof filters.where.newImport != 'undefined' && !lo.isNull(filters.where.newImport)){
      Query.$match.newImport = (filters.where.newImport === 'true');
    }

    if (filters.where.category){
      Query.$match.productCategoryIds = {$in: [filters.where.category]};
    }

    if (filters.where.extraFieldValues && filters.where.extraFieldValues.length > 0){
      if (!Query.$match.$and){
        Query.$match.$and = [];
      }

      for (var i in filters.where.extraFieldValues){
        Query.$match.$and.push({
          $and: [{"extraFieldValues.id": filters.where.extraFieldValues[i].id}, {"extraFieldValues.value": filters.where.extraFieldValues[i].value}]
        });
      }
    }

    if (filters.where.sku){
      var regex = new RegExp( '(' + filters.where.sku + ')', 'gi' );
      Query.$match.sku = {$regex: regex};
    }

    if (filters.where.title){
      var regex = new RegExp( '(' + filters.where.title + ')', 'gi' );
      Query.$match.title = {$regex:regex};
    }

    if (filters.where.term){
      //Add an or for SKU - title
      if (!Query.$match.$or){
        Query.$match.$or = [];
      }

      var regex = new RegExp( '(' + filters.where.term + ')', 'gi' );
      Query.$match.$or.push({title : {$regex:regex}});
      Query.$match.$or.push({sku : {$regex:regex}});
    }

    if (typeof filters.where.active != 'undefined' && filters.where.active != null) {
      Query.$match.active = filters.where.active;
    }

    if (filters.where.price){
      if (!Query.$match.$and){
        Query.$match.$and = [];
      }
      var priceRange = [];
      if (filters.where.price.from) {
        priceRange.push({"eshop.price" : {$gt : parseInt(filters.where.price.from)}});
      }

      if (filters.where.price.to) {
        priceRange.push({"eshop.price" : {$lt : parseInt(filters.where.price.to)}});
      }

      Query.$match.$and.push({
        $and :priceRange
      });
    }


    return Query;
  }
});
