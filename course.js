var express = require('express');
var connInfo = require('./connInfo.js');
var Data = require('./data.js');
var DB_api = require('./database/db_api.js');

const resultStatus = {
	"ERR_FORBIDDEN":401,
	"ERR_NOTFOUND": 404,
	"OK": 200
};

const TABLE_NAME = "course";

// ============= read ================================
function listClasses(){
	//db
	var result = new Promise((resolve, reject) => {
		DB_api.scan(TABLE_NAME).then((data) => {
			resolve(data["Item"]);
		}).catch(() => {
			reject("ERR_NOTFOUND");
		});
	});
	return result;
}

function queryClass(para){
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
			resolve(data["Item"]);
		}).catch(() => {
			reject("ERR_NOTFOUND");
		});
	});
}

function getClass(para, res){
	return new Promise((resolve, reject) => {
		//Integrity check
		if(typeof para.action == 'undefined')
		{
			return reject("ERR_FORBIDDEN");
		}
		
		//route
		var result = null;
		switch(para.action){
			case "list":
				result = listClasses();
				break;
			case "query":
				result = queryClass(para);
				break;
			default:
				reject("ERR_FORBIDDEN");
				break;
		}

		result.then((data) => {
			resolve(data);
		}).catch((err) => {
			reject(err);
		});
	});
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
	if(typeof body["weekly"] == 'string'){
		course.weekly = body["weekly"];
	}

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
		apiResponse(getClass(req.query), res);
	}).post((req, res) => {
		writeClass(req, res);
	}).delete((req, res) => {
		console.log("delete class");
	}).put((req, res) => {
		console.log("put class");
		writeClass(req, res);
	});

	app.use('/data/class', userAPI);
}

function apiResponse(promiseResult, res){

	promiseResult.then((data) => {
		if(typeof data == 'object'){
			res.send(JSON.stringify(data));
		}
		else if(typeof data == 'string'){
			res.send(data);
		}
		res.end();
	}).catch((err) => {
		res.sendStatus(resultStatus[err]);
		res.end();
	});
}

function resopnseStatusCode(result, res){
	console.log(resultStatus[result]);
	res.sendStatus(resultStatus[result]);
	res.end();
}


exports.start = route_data;
exports.getCourse = queryClass;

exports.tableName = TABLE_NAME;
