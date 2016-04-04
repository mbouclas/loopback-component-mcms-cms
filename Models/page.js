module.exports = function(Model) {
  var App = require(require.main.filename);//either server or commander

  Model.search = function (q,cb) {
    App.Services.mcmsNodeEshop.Search.get({keyword: q}, function (err, results) {

      cb(null, results);
    });
  };

  Model.remoteMethod(
    'search',
    {
      http: { verb: 'get'},
      description : "Generic search in the model",
      accepts: {arg: 'q', type: 'string'},
      returns: {arg: 'results', type: 'object'}
    }
  );

  Model.findAll = function (req,res,cb) {

    App.Controllers['mcmsNodeEshop']['Cms/Page'].find(req,res,cb);
  };

  Model.remoteMethod(
    'findAll',
    {
      http: { verb: 'get',source : 'query'},
      accepts : [
        {arg: 'req', type: 'object', 'http': {source: 'req'}},
        {arg: 'res', type: 'object', 'http': {source: 'res'}}
      ],
      description : "Similar to /get but with the full workout in the background",
      returns: {arg: 'results', type: 'object'}
    }
  );

  Model.getOne = function (req,res,cb) {
    App.Controllers['mcmsNodeEshop']['Cms/Page'].findOne(req,res,cb);
  };

  Model.remoteMethod(
    'getOne',
    {
      http: { verb: 'get'},
      description : "Similar to /findOne but with full workout",
      accepts : [
        {arg: 'req', type: 'object', 'http': {source: 'req'}},
        {arg: 'res', type: 'object', 'http': {source: 'res'}}
      ],
      returns: {arg: 'results', type: 'object'}
    }
  );

  Model.saveItem = function (req,res,cb) {
    App.Controllers['mcmsNodeEshop']['Cms/Page'].save(req,res,cb);
  };

  Model.remoteMethod(
    'saveItem',
    {
      http: { verb: 'post'},
      description : "Similar to /save but with full workout",
      accepts : [
        {arg: 'req', type: 'object', 'http': {source: 'req'}},
        {arg: 'res', type: 'object', 'http': {source: 'res'}}
      ],
      returns: {arg: 'result', type: 'object'}
    }
  );
};
