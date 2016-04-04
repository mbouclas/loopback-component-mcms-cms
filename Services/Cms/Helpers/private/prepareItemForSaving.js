module.exports = (function (App, Package) {
  var lo = require('lodash');
  //format an item for saving
  return function (item, options) {
    var extraFieldIds = [],
      extraFieldValues = [],
      thumb = {},
      eshop = lo.merge(item.eshop,{
        price : App.Helpers.eshop.floatPriceToInt(parseFloat(item.eshop.price)),
        quantity : item.eshop.quantity || 0,
        list_price : App.Helpers.eshop.floatPriceToInt(parseFloat(item.eshop.list_price))
      }),
      skuParts = item.sku.split('_'),
      baseSku = skuParts[0] || '';

    lo.forEach(item.extraFields,function (field) {
      extraFieldIds.push(field.id);
      extraFieldValues.push({
        id : field.id,
        value : field.value
      });
    });

    lo.forEach(item.images,function (image) {

    });

    return {
      sku : item.sku,
      active : item.active || false,
      baseSku : item.baseSku || baseSku,
      title : item.title,
      permalink : item.permalink,
      description : item.description,
      description_long : item.description_long,
      productCategoryIds : item.productCategoryIds || [],
      extraFieldIds : extraFieldIds,
      extraFieldIdValues : extraFieldValues,
      eshop : eshop,
      thumb : item.thumb || thumb,
      images : item.images || [],
      relatedIds : item.related || [],
      upsellingIds : item.upselling || [],
      productOptions : item.productOptions || {},
      uid : item.uid || {},
      settings : item.settings || {},
      id : item.id || null,
      newImport : false
    };
  }
});
