module.exports = (function (App, Package) {
  var lo = require('lodash');
  return function (Collection,Query, callback) {
    var pipeline = [
      Query
      ,
      {$unwind: '$productCategoryIds'},
      { $group: { _id: "$productCategoryIds", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      {
        $group: { _id: "$_id",
          count:
          { $sum: "$count" }
        }
      }
    ];
    Collection.aggregate(pipeline,function (err,docs) {
      var categoriesIds = [];
      for (var i in docs){
        categoriesIds.push(docs[i]._id);
      }

      //get fields from DB. Filter by settings in case some categories need to stay hidden
      App.models.ProductCategory.find({where: {id: {inq: categoriesIds}}})
        .then(function (categories) {
          var returnCategories = [];

          lo.forEach(categories,function (category) {
            var found = lo.find(docs,{_id : category.id});
            if (found){
              returnCategories.push({
                category : category.category,
                permalink : category.permalink,
                count : found.count
              });
            }

          });

          callback(null,lo.orderBy(returnCategories,['count'],['desc']));

        })
        .catch(callback);
      
    });
  }
});
