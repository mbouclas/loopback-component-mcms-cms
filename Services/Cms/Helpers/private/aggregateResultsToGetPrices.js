module.exports = (function (App, Package) {
  var lo = require('lodash');

  return function (Collection,Query, callback) {
    var priceRangeInterval = App.Config.eshop.priceRangeInterval || 40,
      priceRangeSteps = App.Config.eshop.priceRangeSteps || 4,
      ranges = {},
      labels = {};

    for (var i = 0; priceRangeSteps > i; i++) {
      var tmp = {},
        label = '';
      if (i == 0) {
        label = "0-" + priceRangeInterval;
        labels[label] = '$'+label;
        tmp[label] = {
          "$cond": [{
            $and: [
              {$gte: ["$eshop.price", 0]},
              {$lt: ["$eshop.price", priceRangeInterval * 100]}
            ]
          }, true, false]
        };
        ranges[label] = tmp;
        continue;
      }
      if (i == priceRangeSteps - 1) {
        label = ((priceRangeInterval * priceRangeSteps) + 1) + "-";
        labels[label] = '$' + label;
        tmp[label] = {
          "$cond": [{
            $and: [
              {$gte: ["$eshop.price", ((priceRangeInterval * priceRangeSteps) + 1) * 100]}
            ]
          }, true,false]
        };
        ranges[label] = tmp;
        continue;
      }

      label = (priceRangeInterval * i) + "-" + ((priceRangeInterval * (i + 1)) - 1);
      labels[label] = '$' + label;
      tmp[label] = {
        "$cond": [{
          $and: [
            {$gte: ["$eshop.price", (priceRangeInterval * i) * 100]},
            {$lt: ["$eshop.price", ((priceRangeInterval * (i + 1)) - 1) * 100]}
          ]
        }, true, false]
      };
      ranges[label] = tmp;
    }

    var pipeline = [
      Query,
      {
        "$project": ranges
      },
      {
        "$group": {  _id:  labels,count: { $sum: 1 }}
      },

      {$sort: {"_id": 1}}
    ];

    Collection.aggregate(pipeline,function (err, docs) {
      if (err){
        return callback(err);
      }

      var prices = [];

      for (var i in docs){
        var _id;
        for (var a in docs[i]._id){
          if (docs[i]._id[a][a] === false) { continue; }
          _id = a;
        }

        if (!_id){
          continue;
        }

        var price = {
            count : docs[i].count,
            label : _id
          },
          numericRange = _id.split('-');
        price.from = parseInt(numericRange[0]);
        price.to = parseInt(numericRange[1]) || null;
        prices.push(price);
      }


      callback(null,lo.sortBy(prices,'from'));
    });
  }
});
