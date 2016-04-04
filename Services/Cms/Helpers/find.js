module.exports = (function(App,Package,privateMethods){
  var lo = require('lodash'),
    async = require('async');
  /**
   * query MUST be an object of type {permalink|id... :val} OR {where :{},limit....}
   */
  return function(query,options,callback){
    if (arguments.length == 2){
      var callback = arguments[1],
        options = {};
    } else if (arguments.length == 1){
      var callback = arguments[0],
        options = {};
    }

    var queryDefaults = {
      limit : 10,
      order : 'created_at DESC',
      skip : 0,
      fields : {},
      where : {}
    };

    var Query = App.Helpers.loopback.setUpFilters(query,queryDefaults);

    App.models.Page.paginate(Query)
      .then(function (docs) {
        var items = [];

        for (var i in docs.items){
          items.push(privateMethods.formatItem(docs.items[i],options));
        }

        docs.items = null;
        docs.items = items;

        if (options.relatedSkus){
          //grab ALL ids, query using in, then sort everything out
          var skusToLookFor = [],
            asyncTasks = [];

          for (var i in docs.items){
            skusToLookFor.push(docs.items[i].baseSku);
          }

          var q = {where : {active : true,baseSku : {inq : skusToLookFor}}};
          if (options.relatedSkus == 'full'){
            q.include = ['ExtraFields','Categories'];
          }

          return App.models.Page.find(q).then(function (related) {
            //we have a bunch of related docs. We need to sort them out based on the baseSku
            //group items by sku
            var groupedItems = groupItemsBySku(related);

            lo.forEach(docs.items,function (item) {
              assignGroupedSkusToItem(item,groupedItems);
            });

            //now assign these item to each doc, excluding self
              groupedItems = null;
              callback(null,docs);
            })
            .catch(function (err) {
              callback(err);
            });
        }

        callback(null,docs);
      })
      .catch(function (err) {
        callback(err);
      });
/*    App.models.Page.find({
        where : {
          productCategoryIds : { inq : ["55355ae0d35cb3c46fa5229e"] },
          active : true,
          and : [
            {and : [{"extraFieldValues.id" : "5535627631efa0843554b0ea"},{"extraFieldValues.value" : "808080"}]},
            {and : [{"extraFieldValues.id" : "5535627631efa0843554b0ec"},{"extraFieldValues.value" : "polye"}]},
            {and : [{"extraFieldValues.id" : "5535627631efa0843554b0eb"},{"extraFieldValues.value" : "15"}]}
          ]
        }
      })
      .then(function (docs) {
        console.log(docs)
      })
      .catch(function (err) {
        console.log(err)
      });*/

    function groupItemsBySku(docs) {
      var items = [];

      for (var i in docs){
        items.push(privateMethods.formatItem(docs[i],options));
      }

      return lo.groupBy(items,'baseSku');
    }

    function assignGroupedSkusToItem(item,group) {
      item.relatedSkus = lo.clone(group[item.baseSku]);
      if (typeof item.relatedSkus == 'undefined'){
        return item;
      }

      item.relatedSkus.splice(lo.findIndex(item.relatedSkus,{id : item.id}),1);
      return item;
    }
  };
});
