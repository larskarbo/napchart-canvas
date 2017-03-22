// Dependencies
var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var favicon = require('serve-favicon');
var logger = require('./logger.js');
var nconf = require('nconf');

var environment = process.env.NODE_ENV || 'development';

nconf.argv()
.file({ file: 'config.json' });

if(nconf.get('setup')){
	setup();
}else if(nconf.get('create-tables')){
	createTables();
}else if(nconf.get('exportJson')){
	exportJson();
}else if(nconf.get('importJson')){
	importJson();
}else if(!nconf.get('mysql')){
	logger.info('No mysql credentials found');
	logger.info('To set up a server, run node script --setup');
	logger.info('running napchart without database capabilities');

	start(false);
}else{
	start(true);
}

function setup() {
	var install = require('./install.js');

	install.setup(function(){
		process.exit();
	});
}

function createTables() {
	var install = require('./install.js');

	install.createTables(function(){
		process.exit();
	})
}

function exportJson() {
	var database = require('./database.js');

	database.exportJson(function(horse,error){
		if(error){
			logger.error(error);
		}else{
			logger.verbose('finished')
			process.exit();
		}
	})
}

function importJson() {
	var database = require('./database.js');
	var file = nconf.get('file') | 'export.json';

	database.importJson(file, function(horse,error){
		if(error){
			logger.error(error);
		}else{
			logger.verbose('finished')
			process.exit();
		}
	})
}

function start(db){
	app.use(express.static('public'));
	app.use('/js/lib', express.static('lib'));
	app.use(favicon(__dirname + '/public/img/favicon.ico')); //serve favicon
	app.use(bodyParser.json());
	app.use(bodyParser.urlencoded({
		extended: true
	}));

	app.set('view engine', 'ejs');

	//Routes:

	//index
	app.get('/', function (req, res) {
		var host = req.headers.host;

		res.render('pages/main',{chartid:null,chart:null, url:host, db:db});
	});

	if(db){

		//chart
		app.get('/:chartid', function (req, res) {
			var chartid = req.params.chartid;
			var host = req.headers.host;
			var database = require('./database.js');

			database.getChart(chartid, function(chartData,error){
				if(error){
					if(error == 404){
						res.redirect('/');
						//res.render('pages/main',{chartid:null,chart:null, url:host, db:db});
					}else{
						logger.error("There was a problem when creating a new chart:", error);
						res.writeHead(503);
						res.end("error");
					}
				}else{
					res.render('pages/main',{chartid:chartid,chart:JSON.stringify(chartData), url:host, db:db});
				}
			});

		});

		//get schedule data (used for ajax requests ( not currently in use))
		// app.get('/get/:chartid', function(req, res) {
		// 	var chartid = req.params.chartid;

		// 	getObject(chartid,function(object){

		// 		res.writeHead(200, {"Content-Type": "application/json"});
		// 		res.end(JSON.stringify(output));

		// 	});
		// });

		//save schedule
		app.post('/post', function (req, res) {
			var database = require('./database.js');
			var data = JSON.parse(req.body.data);
			database.newChart(req,data, function(chartid,error){
				if(error){
					logger.error("There was a problem when creating a new chart:", error);
					res.writeHead(503);
					res.end("error");
				}else{
					res.writeHead(200);
					res.end(chartid);
				}
			});

		});

		app.post('/post/feedback', function (req,res){
			var text = req.body.message;
			var database = require('./database.js');

			database.postFeedback(text, function(result, error){
				if(error){
					logger.error("There was a problem when posting feedback:", error);
					res.writeHead(503);
					res.end("error");
				}else{
					res.writeHead(200);
					res.end(JSON.stringify(result,null,2));
				}
			})
		});
		app.post('/post/linkEmailToFeedback', function (req,res){
			var token = req.body.token;
			var email = req.body.email;
			var database = require('./database.js');
			console.log("email:", email);

			database.linkEmailToFeedback(token, email, function(result, error){
				if(error){
					logger.error("There was a problem when posting feedback:", error);
					res.writeHead(503);
					res.end("error");
				}else{
					res.writeHead(200);
					res.end(JSON.stringify(result));
				}
			})
		});
	}


	// app.get('*', function (req, res) {
	// 	res.send('404');
	// });

	var server_port = process.env.OPENSHIFT_NODEJS_PORT || 3000
	var server_ip_address = process.env.OPENSHIFT_NODEJS_IP || '0.0.0.0'
	var server = app.listen(server_port,server_ip_address);

	logger.info('Napchart started at %s:%s', server_ip_address, server_port)

	var livereload = require('livereload');
	var lrserver = livereload.createServer();
	lrserver.watch([__dirname + "/lib/dist", __dirname + "/public"]);
	
}
