module.exports = (function (App, Package) {
  var lo = require('lodash');
  return function (Collection,Query, callback) {
    var pipeline = [
      Query
      ,
      {$unwind: '$extraFieldValues'},
      { $group: { _id: { fieldId: "$extraFieldValues.id", value: "$extraFieldValues.value" }, count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      {
        $group: { _id: "$_id.fieldId",
          values:
          { $push: { label: "$_id.value", count: "$count"  } }
        }
      }
    ];

    Collection.aggregate(pipeline,function (err,extraFields) {
      //Group & sort extraFields, group them by extra field. We need to grab all Extra fields first
      var allFields = {},
        fieldIds = [],
        returnFields = [],
        tempFields;
      for (var i in extraFields){
        fieldIds.push(extraFields[i]._id);
      }
      //get fields from DB
      App.models.ExtraField.find({where: {id: {inq: fieldIds}}})
        .then(function (fields) {
          fields = lo.sortBy(fields,'orderBy');
          lo.forEach(fields,function (field) {
            var found = lo.find(extraFields,{_id : field.id.toString()});

            if (found){
              if (field.fieldOptions && field.fieldOptions.length > 0){
                for (var i in found.values){
                  var fieldOption = lo.find(field.fieldOptions,{varName : found.values[i].label});
                  found.values[i].title =  (fieldOption) ? fieldOption.title : found.values[i].label;
                }
              }

              returnFields.push({
                title : field.title,
                permalink : field.permalink,
                varName : field.varName,
                settings : field.settings,
                // fieldOptions : field.fieldOptions,
                values : found.values
              });
            }

          });

          callback(null,returnFields);

        })
        .catch(callback);

    });
  }
});
