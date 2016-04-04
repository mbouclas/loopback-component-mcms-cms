module.exports = (function (App, Package) {
  var lo = require('lodash');
  //format an item for public use
  return function (item,options) {
    var categories = [],
      images = [];

      if (!item.thumb){
          item.thumb = {};
      }

      if (!item.images){
          item.images = [];
      }

    //map categories
    lo.forEach(item.Categories(),function (category) {
      categories.push({
        category : category.category,
        description : category.description,
        permalink : category.permalink,
        orderBy : category.orderBy,
        settings : category.settings,
        parentId : category.parentId,
        id : category.id
      });
    });

    //clean up thumb
    var thumb = {
      alt : item.thumb.alt || item.title,
      title : item.thumb.title || item.title,
      copies : setupImage(item.thumb.copies)
    };

    if (lo.isArray(item.images) && item.images.length > 0){
      for (var i in item.images){
        images.push({
          alt : item.images[i].alt || item.title,
          title : item.images[i].title || item.title,
          copies : setupImage(item.images[i].copies)
        });
      }
    }

    var toReturn = {
      sku : item.sku,
      baseSku : item.baseSku,
      title : item.title,
      permalink : item.permalink,
      description : item.description,
      description_long : item.description_long,
      categories : categories,
      settings : item.settings,
      thumb : thumb,
      images : item.images,
      related : item.related,
      id : item.id
    };

    if (options && options.returnType == 'full'){
      toReturn.created_at = item.created_at;
      toReturn.updated_at = item.updated_at;
      toReturn.pageCategoryIds = item.productCategoryIds;
      toReturn.uid = item.uid;
      toReturn.active = item.active;
      toReturn.thumb = item.thumb;
    }

    return toReturn;

  };

  function setupImage(copies) {
    var ret = {};
    lo.forEach(copies,function (copy,name) {
      ret[name] = {
        imageUrl : copy.imageUrl
      };
    });

    return ret;
  }
});
