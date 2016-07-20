var express = require('express');
var connInfo = require('./connInfo.js');
var Data = require('./data.js');
var DB_api = require('./database/db_api.js');

var resultStatus = {
	"ERR_FORBIDDEN":401,
	"ERR_NOTFOUND": 404,
	"OK": 200
};

var TABLE_NAME = "course";

// ============= read ================================
function listClasses(res){
	//db
	var result = new Promise((resolve, reject) => {
		DB_api.scan(TABLE_NAME).then((data) => {
			res.send(data);
			resolve("OK");
		}).catch(() => {
			resolve("ERR_NOTFOUND");
		});
	});
	return result;
}

function queryClass(para, res){
	return new Promise((resolve, reject) => {
		var key = {};
		if(typeof para.name != 'undefined'){
			key["name"] = para.name;
		}
		if(typeof para.teacher != 'undefined'){
			key["teacher"] = para.teacher;
		}
		if(key.length == 0)
			reject();

		//db
		DB_api.read(TABLE_NAME, key).then((data) => {
			res.send(data);
			resolve("OK");
		}).catch(() => {
			resolve("ERR_NOTFOUND");
		});
	});
}

function getClass(req, res){
	var para = req.query;
	
	//Integrity check
	if(typeof para.action == 'undefined')
	{
		return resopnseStatusCode("ERR_FORBIDDEN", res);
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
			result = new Promise((resolve, reject) => {
				resolve("ERR_FORBIDDEN");
			});
			break;
	}

	result.then((status) => {
		resopnseStatusCode(status, res);
	});
	return;
}


// ============== write =========================
function writeClass(req, res){
	console.log(req.body);
	var body = req.body;

	//Integrity check
	if((typeof body["name"] == 'undefined') || 
		(typeof body["teacher"] == 'undefined'))
	{
		resopnseStatusCode("ERR_FORBIDDEN", res);
		return;
	}

	var course = new Data.Course(body["name"], body["teacher"]);

	DB_api.write(COURSE_TABLE, course).then(() => {
		resopnseStatusCode("OK", res);
	}).catch((err) => {
		resopnseStatusCode("ERR_FORBIDDEN", res);
	});

	
}

//============= routing =====================
function route_data(app){
	var userAPI = express.Router();
	
	userAPI.route('/').get((req, res) => {
		getClass(req, res);
	}).post((req, res) => {
		writeClass(req, res);
	}).delete((req, res) => {
		console.log("delete class");
	}).put((req, res) => {
		console.log("put class");
		res.end("");
	});

	app.use('/data/class', userAPI);
}

function resopnseStatusCode(result, res){
	console.log(resultStatus[result]);
	res.sendStatus(resultStatus[result]);
	res.end();
}


exports.start = route_data;
