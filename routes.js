module.exports = function (App, Package) {

  var router = App.loopback.Router();
  var Route = App.Route;

  App.use(router);

  return router;
};
