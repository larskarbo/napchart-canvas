// Dependencies
var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);


var bodyParser = require('body-parser');
var favicon = require('serve-favicon');
var logger = require('./logger.js');
var nconf = require('nconf');
var fs = require('fs');

var environment = process.env.NODE_ENV || 'development';

nconf.argv()
.file({ file: 'config.json' });

start();

function start(){
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

		res.render('pages/main',{chartid:null,chart:null, url:host, db:false});
	});

	var server_port = process.env.OPENSHIFT_NODEJS_PORT || 3500
	var server_ip_address = process.env.OPENSHIFT_NODEJS_IP || '0.0.0.0'

	var server = http.listen(server_port,server_ip_address);

	logger.info('Napchart started at %s:%s', server_ip_address, server_port)

	var livereload = require('livereload');
	var lrserver = livereload.createServer();
	lrserver.watch([__dirname + "/lib/dist", __dirname + "/public"]);
	
	io.on('connection', function(socket){
	  console.log('a user connected');
	  socket.on('disconnect', function(){
	    console.log('user disconnected');
	  });
	});
	
	fs.watch(__dirname + '/lib/dist/dist.js', {encoding: 'utf8'}, (eventType, filename) => {
		var Napchart = {}
		console.log('yeeeeee')
		// fs.readFile(__dirname + '/lib/dist/dist.js', {encoding: 'utf8'}, (err, data) => {
		//   if (err) throw err;
		//   var cfg = eval(data)
		//   console.log(cfg)
		//   if(typeof cfg === 'undefined')
		//   	return
		//   cfg(Napchart)
		  io.emit('update', filename);
		// });
	})
}
