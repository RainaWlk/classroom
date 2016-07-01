var express = require('express');
var connInfo = require('./connInfo.js');
var Data = require('./data.js');
var DB_api = require('./database/db_api.js');

var resultStatus = {
	"ERR_FORBIDDEN":401,
	"ERR_NOTFOUND": 404,
	"OK": 200
};

var COURSE_TABLE = "course";


function listClasses(res){
	
	//db
	var result = new Promise((resolve, reject) => {
		DB_api.read(COURSE_TABLE).then((data) => {
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
		//Integrity check
		if(para.name == 'undefined')
		{
			resolve("ERR_FORBIDDEN");
			return;
		}


		//db
		resolve("ERR_NOTFOUND");
	});
}

function getClass(req, res){
	var para = req.query;
	
	//Integrity check
	if(para.action == 'undefined')
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

/*var data = {
	"name": "BRD",
	"teacher": "喵咪咪",
	"students": []
}

DB_api.write(COURSE_TABLE, data);*/

	return;
}

//bug: need to check table existed
function initCourse(){
	DB_api.createTable(COURSE_TABLE, Data.CourseSchema, "name").then(() => {
		console.log("create done");
	});
}

//============= routing =====================
function route_data(app){
	var userAPI = express.Router();
	
	userAPI.route('/class').get((req, res) => {
		console.log("get class");
		getClass(req, res);
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

function resopnseStatusCode(result, res){
	console.log(resultStatus[result]);
	res.sendStatus(resultStatus[result]);
	res.end();
}


exports.start = route_data;
exports.init = initCourse;