var path = require('path');
var express = require('express');
var course = require('./course.js');
var connInfo = require('./connInfo.js');
var LISTEN_PORT = 80;

function startServer(){
	var app = express();

	
	
	//web services
	course.go(app);

	//static
	app.use(express.static(path.join(__dirname, 'frontend')));
	//app.use(function(req, res){
	//	res.sendStatus(404);
	//});

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