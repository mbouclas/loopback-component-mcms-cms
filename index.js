module.exports = function (App, options) {

  function ServiceProvider() {
    this.package = {
      name : 'mcmsNodeCMS'
    };


    App.Controllers[this.package.name] = this.package.Controllers =  App.helpersLoader.loadServices(__dirname + '/Controllers', true, this.package);
    App.Services[this.package.name] = this.package.Services =  App.helpersLoader.loadServices(__dirname + '/Services', null, this.package);
    App.Workers[this.package.name] =  this.package.Workers =  App.helpersLoader.loadDirContents(__dirname + '/Workers', null, this.package);

    require('./routes')(App,this.package);


    App.Services.mcmsNodeAdmin.Admin.registerModule(require('./admin-package.json'),__dirname + '/admin');

    App.Log.info('Eshop module loaded');
  }

  return new ServiceProvider();
};
