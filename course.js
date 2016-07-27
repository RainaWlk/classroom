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
	let result = new Promise((resolve, reject) => {
		DB_api.scan(TABLE_NAME).then((data) => {
			if(Data.isEmpty(data))
			{
				reject("ERR_NOTFOUND");
			}
			else
			{
				resolve(data);
			}
		}).catch(() => {
			reject("ERR_NOTFOUND");
		});
	});
	return result;
}

function queryClass(para){
	return new Promise((resolve, reject) => {
		let key = {};
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
			if(Data.isEmpty(data))
			{
				reject("ERR_NOTFOUND");
			}
			else
			{
				resolve(data);
			}			
		}).catch(() => {
			reject("ERR_NOTFOUND");
		});
	});
}

function getClass(para, res){
	return new Promise((resolve, reject) => {
		//route
		let result = null;

		if(Data.isEmpty(para)){
			result = listClasses();
		}
		else
		{
			if(typeof para["name"] != 'string'){
				return reject("ERR_FORBIDDEN");
			}
			result = queryClass(para);
		}

		result.then((data) => {
			resolve(data);
		}).catch((err) => {
			reject(err);
		});
	});
}


// ============== write =========================
function writeClass(body){
	return new Promise((resolve, reject) => {
		//Integrity check
		if((typeof body["name"] == 'undefined') || 
			(typeof body["teacher"] == 'undefined'))
		{
			return reject("ERR_FORBIDDEN");
		}

		let course = new Data.Course(body["name"], body["teacher"]);
		if(typeof body["weekly"] == 'string'){
			course.weekly = body["weekly"];
		}

		DB_api.write(TABLE_NAME, course).then(() => {
			resolve();
		}).catch((err) => {
			reject("ERR_FORBIDDEN");
		});

	});
}

//============= routing =====================
function route_data(app){
	let userAPI = express.Router();
	
	userAPI.route('/').get((req, res) => {
		apiResponse(getClass(req.query), res);
	}).post((req, res) => {
		apiResponse(writeClass(req.body), res);
	}).delete((req, res) => {
		console.log("delete class");
	}).put((req, res) => {
		apiResponse(writeClass(req.body), res);
	});

	app.use('/data/course', userAPI);
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

exports.start = route_data;
exports.getCourse = queryClass;

exports.tableName = TABLE_NAME;
