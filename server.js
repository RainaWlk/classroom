var path = require('path');
var express = require('express');
var LISTEN_PORT = 8080;


function startServer(){
	var app = express();

	app.use(express.static(path.join(__dirname, 'frontend')));


	app.use(function(req, res){
       res.sendStatus(404);
   	});

	var server = app.listen(LISTEN_PORT, function(){
		var host = server.address().address;
		var port = server.address().port;

		console.log("Server running at http://"+host+":"+port);
	});
}


function main(){
	startServer();
}

main();