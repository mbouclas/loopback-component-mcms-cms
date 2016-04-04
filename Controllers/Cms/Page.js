module.exports = (function (App, Package) {
  var packageName = Package.name,
    async = require('async'),
    lo = require('lodash'),
    Promise = require('bluebird'),
    Paginator = require('pagination');

  return {
    name: 'Page',
    nameSpace: 'Cms',
    findOne: findOne,
    find: find,
    related: related,
    search: search,
    save: save
  };

  function findOne(req, res, next) {
    /*    if (req.device.type != 'bot'){
     return next();
     }*/

    App.Services['mcmsNodeCMS'].Page.findOne({
      where: {id: req.query.id},
      include: [ 'Categories']
    }, {returnType: 'full'}, function (err, page) {
      if (err) {
        App.Log.error(err);
        return res.render('Errors/500.nunj');
      }

      if (!page) {
        return res.render('Errors/404.nunj');
      }

      res.send(page);
    });
  }

  function find(req, res, next) {
    /*    if (req.device.type != 'bot'){
     return next();
     }*/

    var categoryToLookFor = null;
    var page = 1,
      filters = {},
      ordering = [
        {title: 'Recent arrivals', val: 'created_at', way: 'DESC', alias: 'recentArrivals'},
        {title: 'Price Low to High', val: 'eshop.price', way: 'ASC', alias: 'priceAsc', default: true},
        {title: 'Price High to Low', val: 'eshop.price', way: 'DESC', alias: 'priceDesc'},
        {title: 'Bestsellers', val: 'bestsellers', way: 'ASC', alias: 'bestsellers'}
      ];

    if (req.params.page || req.query.page) {
      page = (req.query.page) ? req.query.page : req.params.page;
    }

    if (req.params.permalink || req.query.category) {
      categoryToLookFor = (req.query.category) ? req.query.category : req.params.permalink;
    }

    /*
     * The aggregation queries match must be the same as the original query, right now it's not
     * So, after we build our original query, we need to build the aggregation one as well
     * An aggregation on the categories would be usefull
     * Also, all aggregations should be running on parallel instead of waterfall as they do now
     * */
    var asyncTasks = [],
      Category = {};

    if (categoryToLookFor) {
      asyncTasks.push(findCategoryByPermalink);
    }

    asyncTasks.push(lookUpFilters);
    asyncTasks.push(fetchPages);

    async.waterfall(asyncTasks, function (err, pages) {
      //handle errors
      if (err) {
        App.Log.error(err);
        return res.render('Errors/500.nunj');
      }

      var paging = new Paginator.SearchPaginator({
        prelink: '/',
        current: page,
        rowsPerPage: filters.limit,//this is set in the function lookUpFilters
        totalResult: pages.pages.counters.itemsTotal
      }).getPaginationData();
      paging.limit = filters.limit;

      next(null, {
        Pages: pages.pages.items, counters: pages.pages.counters
        , Category: Category, Pagination: paging
      });
    });

    function findCategoryByPermalink(next) {
      //Handle no category found
      App.models.PageCategory.findOne({where: {permalink: categoryToLookFor}}, function (err, category) {
        if (err) {
          App.Log.error(err);
          return res.render('Errors/500.nunj');
        }

        //This is a 404
        if (!category) {
          return res.render('Errors/404.nunj');
        }

        Category = category;
        next();
      });
    }

    function lookUpFilters(next) {
      var validLimits = [12, 24, 36],
        sort = lo.find(ordering, {default: true});

      filters = {
        where: {
          extraFieldValues: [],
          sku: null,
          active: null,
          price: null
        },
        order: {field: sort.val, way: sort.way},
        limit: App.Config.eshop.catalogue.resultsPerPage,
        skip: 0
      };

      lo.forEach(req.query, function (item, key) {
        var parts = key.split('-');
        if (parts[0] == 'filter') {
          var found = lo.find(App.Cache['ExtraField'], {varName: parts[1]});
          if (found) {
            filters.where.extraFieldValues.push({
              id: found.id.toString(),
              value: item
            });
          }

        }

        if (key == 'price') {
          var priceRange = item.split('-');

          if (priceRange.length >= 1 && priceRange.length < 3) {
            filters.where.price = {
              from: parseInt(priceRange[0]) * 100
            };
            if (priceRange[1]) {
              filters.where.price.to = parseInt(priceRange[1]) * 100
            }
          }
        }

        if (key == 'sku') {
          filters.where.sku = item;
        }

        if (key == 'title') {
          filters.where.title = item;
        }

        if (key == 'page') {
          filters.skip = (item == 1) ? 0 : item * filters.limit;
        }

        if (key == 'active' && item) {
          filters.where.active = item;
        }

        if (key == 'newImport') {
          filters.where.newImport = item;
        }

        if (key == 'orderBy') {
          var orderBy = lo.find(ordering, {alias: item});
          if (!orderBy) {
            orderBy = lo.find(ordering, {default: true});
          }

          filters.order.field = orderBy.val;
          filters.order.way = orderBy.way;
        }

        if (key == 'limit') {
          if (validLimits.indexOf(parseInt(item)) == -1) {
            return;
          }

          filters.limit = parseInt(item);
        }

        if (key == 'term') {
          filters.where.term = item;
        }
      });

      next(null, filters);
    }

    function fetchPages(filters, next) {
      if (Category.id) {
        filters.where.category = Category.id;
      }
      filters.include = ['Categories'];

      App.Services['mcmsNodeCMS'].Page.filter(filters, {aggregations: [], returnType: 'full'})
        .then(function (results) {
          results.category = Category;
          next(null, results);
        })
        .catch(function (err) {
          handle500(err);
        });
    }


  }

  function related(req, res, next) {
    /*    if (req.device.type != 'bot'){
     return next();
     }*/

    App.Services['mcmsNodeCMS'].Page.findOne({
      where: {id: req.params.id},
      include: []
    }, {relatedSkus: true}, function (err, page) {
      if (err) {
        App.Log.error(err);
        return res.send({error: err}).status(500);
      }

      if (!page) {
        return res.send({error: 'not found'}).status(404);
      }

      res.send(page);
    });
  }

  function search(req, res, next) {
    //search via a term or other filters
    //searches in pages - categories - extra fields?

  }

  function save(req, res, next) {
    App.Services['mcmsNodeCMS'].Page.save(req.body.item)
      .then(function (result) {
        return next(null, result);
      });
  }

  function handle500(err) {
    App.Log.error(err);
    return res.render('Errors/500.nunj');
  }

});
