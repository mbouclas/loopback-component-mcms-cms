module.exports = (function (App, Package) {
  var lo = require('lodash');
  //format an item for public use
  return function (item,options) {
    App.Helpers.eshop.applyTaxAndDiscountToProduct(item);

    var extraFields = [],
      categories = [],
      images = [],
      eshop = {
        intPrice : item.eshop.price,
        price : App.Helpers.eshop.intPriceToFloat(item.eshop.price)
      };

    //map fields with values
    lo.forEach(item.ExtraFields(),function (field) {
      var found = lo.find(item.extraFieldValues,{id : field.id.toString()});
      if (!found){
        return;
      }

      extraFields.push({
        value : found.value,
        title : field.title,
        permalink : field.permalink,
        varName : field.varName,
        type : field.type,
        fieldOptions : field.fieldOptions,
        settings : field.settings,
        id : field.id
      });

    });

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
      extraFields : extraFields,
      settings : item.settings,
      eshop : eshop,
      thumb : thumb,
      images : item.images,
      related : item.related,
      upselling : item.upselling,
      productOptions : item.productOptions,
      id : item.id
    };

    if (options && options.returnType == 'full'){
      toReturn.created_at = item.created_at;
      toReturn.updated_at = item.updated_at;
      toReturn.productCategoryIds = item.productCategoryIds;
      toReturn.extraFieldIds = item.extraFieldIds;
      toReturn.uid = item.uid;
      toReturn.active = item.active;
      toReturn.thumb = item.thumb;
      toReturn.eshop = lo.merge(item.eshop,eshop);
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
