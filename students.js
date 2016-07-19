var express = require('express');
var connInfo = require('./connInfo.js');
var Data = require('./data.js');
var DB_api = require('./database/db_api.js');

var resultStatus = {
	"ERR_FORBIDDEN":401,
	"ERR_NOTFOUND": 404,
	"OK": 200
};

var TABLE_NAME = "students";

// ============= read ================================
function getData(req, res){
	var para = req.query;
	
	//Integrity check
	if(typeof para["name"] == 'undefined')
	{
		return resopnseStatusCode("ERR_FORBIDDEN", res);
	}

	var key = {
		"name": para["name"]
	};

	//db
	DB_api.read(TABLE_NAME, key).then((data) => {
		res.send(data);
		resopnseStatusCode("OK", res);
	}).catch(() => {
		resopnseStatusCode("ERR_NOTFOUND", res);
	});

	return;
}


// ============== write =========================
function writeData(req, res){
	console.log(req.body);
	var body = req.body;

	//Integrity check
	if(typeof body["name"] == 'undefined')
	{
		resopnseStatusCode("ERR_FORBIDDEN", res);
		return;
	}

	var student = new Data.Student(body["name"]);

	DB_api.write(TABLE_NAME, student).then(() => {
		resopnseStatusCode("OK", res);
	}).catch((err) => {
		resopnseStatusCode("ERR_FORBIDDEN", res);
	});

	
}

//============= routing =====================
function route_data(app){
	var userAPI = express.Router();
	
	userAPI.route('/student').get((req, res) => {
		getData(req, res);
	}).post((req, res) => {
		writeData(req, res);
	}).delete((req, res) => {
		console.log("delete class");
	}).put((req, res) => {
		console.log("put class");
		res.end("");
	});

	app.use('/data', userAPI);
}

function resopnseStatusCode(result, res){
	console.log(resultStatus[result]);
	res.sendStatus(resultStatus[result]);
	res.end();
}


exports.start = route_data;
