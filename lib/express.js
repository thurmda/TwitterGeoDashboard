
module.exports.initApp = function(express, config){ 
var app =  express.createServer();
	// Configuration
	app.configure(function(){
	  app.set('views', __dirname + '/..' + '/views');
	  app.set('view engine', 'ejs');
	  app.use(express.bodyParser());
	  app.use(express.methodOverride());
	  app.use(app.router);
	  app.use(express.static(__dirname + '/..' +'/public'));
	});
	
	app.configure('development', function(){
	  app.use(express.errorHandler({ dumpExceptions: true, showStack: true })); 
	});
	
	app.configure('production', function(){
	  app.use(express.errorHandler()); 
	});
	
	// Route
	app.get('/', function(req, res){
	  res.render('index', {
	    title: config.app.title
	  });
	});
	
	app.listen(config.express.port);
	console.log("Express server listening on port %d", app.address().port);

return app;
}