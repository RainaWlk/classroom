var path = require('path');
var express = require('express');
var bodyParser = require('body-parser');
var Data = require('./data.js');
var course = require('./course.js');
var students = require('./students.js');
var connInfo = require('./connInfo.js');
var LISTEN_PORT = 8080;

function startServer(){
	var app = express();
	app.use(bodyParser.json()); // for parsing application/json
	
	//init
	Data.init().then(() => {
		//web services
		course.start(app);
		students.start(app);
	}).catch(() => {
		//quit

	});

	//static
	app.use(express.static(path.join(__dirname, 'frontend')));
	app.use(function(req, res){
		res.sendStatus(404);
	});

	var server = app.listen(process.env.PORT || LISTEN_PORT, function(){
		var host = server.address().address;
		var port = server.address().port;

		console.log("Server running at http://"+host+":"+port);
	});

	//connInfo.app = app;
}


function main(){
	startServer();
}

main();