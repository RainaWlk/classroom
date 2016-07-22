var express = require('express');
var connInfo = require('./connInfo.js');
var Data = require('./data.js');
var course = require('./course.js');
var DB_api = require('./database/db_api.js');

var resultStatus = {
	"ERR_FORBIDDEN":401,
	"ERR_NOTFOUND": 404,
	"OK": 200
};

var TABLE_NAME = "students";

// ============= read ================================
function getData(para){
	return new Promise((resolve, reject) => {
		//Integrity check
		if(typeof para["name"] == 'undefined')
		{
			return reject("ERR_NOTFOUND");
		}

		var key = {
			"name": para["name"]
		};

		//db
		DB_api.read(TABLE_NAME, key).then((data) => {
			if(typeof data["Item"] == 'undefined'){
				reject("ERR_NOTFOUND");
			}
			else{
				resolve(data["Item"]);
			}
		}).catch(() => {
			reject("ERR_NOTFOUND");
		});
	});
}


// ============== write =========================
function writeData(body){
	return new Promise((resolve, reject) => {
		//Integrity check
		if(typeof body["name"] == 'undefined')
		{
			return reject("ERR_FORBIDDEN");
		}

		var student = new Data.Student(body["name"]);

		DB_api.write(TABLE_NAME, student).then(() => {
			resolve();
		}).catch((err) => {
			reject("ERR_FORBIDDEN");
		});

	});
}

// ============== write =========================
function deleteData(body){
	
	var doDelete = function(table, para){
		return new Promise((resolve, reject) => {
			console.log(para);
			DB_api.delete(table, para).then(() => {
				resolve();
			}).catch((err) => {
				reject(err);
			});
		})
	};

	return new Promise((resolve, reject) => {
		//Integrity check
		if(typeof body["name"] == 'undefined')
		{
			return reject("ERR_FORBIDDEN");
		}
		
		//empty check
		var getKey = {
			"name": body["name"]
		};
		getData(getKey).then((data) => {
			var allowDelete = true;

			for(var i in data){
				//check course empty
				if((typeof data[i]["course"] != 'undefined') && 
					(data[i]["course"].length != 0)){
					allowDelete = false;
				}
				break;
			}

			if(allowDelete){
				var student = {
					"name" : body["name"]
				};
				return doDelete(TABLE_NAME, student);
			}
			else
			{
				//bug: quit promise chain?
				console.log("quit chain");
				return Promise.reject();
			}
		}).then(() => {
			resolve();
		}).catch(() => {
			console.log("delete catch");
			reject("ERR_NOTFOUND");
		});

	});
}

function attendCourse(body){
	return new Promise((resolve, reject) => {
		var studentData = null;
		//var courseData = null;

		//find student obj
		var getKey = {
			"name": body["name"]
		};
		getData(getKey).then((data) => {
			console.log(data);
			studentData = data;

			var courseKey = {
				"name": body["courseName"]
			}
			return course.getCourse(courseKey);
		}).then((courseData) => {

			var student = new Data.Student(studentData["name"]);
			student["course"].push({
				"name": courseData["name"],
				"absentData": [],
				"suspend": false
			});

			//write to student table
			DB_api.write(TABLE_NAME, student).then(() => {
				resolve();
			}).catch((err) => {
				reject("ERR_FORBIDDEN");
			});

			//write to course table

		}).catch(() => {
			console.log("attendCourse catch");
			reject("ERR_NOTFOUND");
		});
	});
}

//============= routing =====================
function route_data(app){
	var userAPI = express.Router();
	var result = null;

	userAPI.route('/').get((req, res) => {
		apiResponse(getData(req.query), res);
	}).post((req, res) => {
		apiResponse(writeData(req.body), res);
	}).delete((req, res) => {
		apiResponse(deleteData(req.body), res);
	});

	userAPI.route('/course').get((req, res) => {
		console.log("get student course");
	}).post((req, res) => {
		apiResponse(attendCourse(req.body), res);
	}).delete((req, res) => {
		console.log("delete student course");
		
	}).put((req, res) => {
		console.log("put class");
		res.end("");
	});


	app.use('/data/student', userAPI);
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
