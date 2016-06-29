var express = require('express');
var connInfo = require('./connInfo.js');
var data = require('./data.js');

var resultStatus = {
	"ERR_FORBIDDEN":401,
	"ERR_NOTFOUND": 404,
	"OK": 200
};


function listClasses(res){
	
	//db
}

function queryClass(para, res){
	//Integrity check
	if(para.name == 'undefined')
	{
		return "ERR_FORBIDDEN";
	}
	
	//db
	
}

function getClass(req, res){
	var para = req.query;
	
	//Integrity check
	if(para.action == 'undefined')
	{
		return "ERR_FORBIDDEN";
	}
	
	//route
	var result = null;
	switch(para.action){
		case "list":
			result = listClasses(res);
			break;
		case "query":
			result = queryClass(para, res);
			break;
		default:
			result =  "ERR_FORBIDDEN";
			break;
	}
	
	return result;
}

function resopnseStatusCode(result, res){
	res.sendStatus(resultStatus.result);
	res.end();
}

function route_data(app){
	var userAPI = express.Router();
	
	userAPI.route('/class').get((req, res) => {
		console.log("get class");
		var result = getClass(req, res);
		resopnseStatusCode(result, res);
	}).post((req, res) => {
		console.log("post class");
		res.end("");
	}).delete((req, res) => {
		console.log("delete class");
	}).put((req, res) => {
		console.log("put class");
		res.end("");
	});

	app.use('/data', userAPI);
}




exports.go = route_data;