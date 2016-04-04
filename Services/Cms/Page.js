module.exports = (function(App,Package){
  var Promise = require('bluebird');
  privateMethods = {
    formatItem : require('./Helpers/private/formatItem')(App,Package),
    aggregateResultsToExtraFields : require('./Helpers/private/aggregateResultsToExtraFields')(App,Package),
    aggregateResultsToGetPrices : require('./Helpers/private/aggregateResultsToGetPrices')(App,Package),
    aggregateResultsToCategories : require('./Helpers/private/aggregateResultsToCategories')(App,Package),
    prepareItemForSaving : require('./Helpers/private/prepareItemForSaving')(App,Package),
    queryBuilder : require('./Helpers/private/queryBuilder')(App,Package)
  };



  return {
    name : 'Page',
    nameSpace : 'Cms',
    find : Promise.promisify(require('./Helpers/find')(App,Package,privateMethods)),
    findOne : Promise.promisify(require('./Helpers/findOne')(App,Package,privateMethods)),
    filter : Promise.promisify(require('./Helpers/filter')(App,Package,privateMethods)),
    search : require('./Helpers/search')(App,Package,privateMethods),
    save : require('./Helpers/save')(App,Package,privateMethods)
  };
});
