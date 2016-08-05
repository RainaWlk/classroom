var express = require('express');
var connInfo = require('./connInfo.js');
var Data = require('./data.js');
var course = require('./course.js');
var DB_api = require('./database/db_api.js');

const resultStatus = {
	"ERR_FORBIDDEN":401,
	"ERR_NOTFOUND": 404,
	"OK": 200
};

const TABLE_NAME = "students";

// ============= read ================================
function getData(para){
	return new Promise((resolve, reject) => {
		//Integrity check
		if(typeof para["name"] == 'undefined')
		{
			return reject("ERR_NOTFOUND");
		}

		let key = {
			"name": para["name"]
		};

		//db
		DB_api.read(TABLE_NAME, key).then((data) => {
			if(Data.isEmpty(data)){
				reject("ERR_NOTFOUND");
			}
			else{
				resolve(data);
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

		let student = new Data.Student(body["name"]);

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
		let getKey = {
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
	console.log(body);
	return new Promise((resolve, reject) => {
		//find student obj
		var getKey = {
			"name": body["name"]
		};
		var result1 = getData(getKey);

		//find course obj
		var courseKey = {
			"name": body["courseName"]
		}
		var result2 = course.getCourse(courseKey);

		Promise.all([result1, result2]).then(dataArray => {
			var studentData = dataArray[0];
			var courseData = dataArray[1];
			var index = null;

			var searchExisted = function(obj, key){
				var found = null;

				for(let i in obj){
					if( obj[i]["name"] == key){
						found = i;
						break;
					}
				}
				return found;
			};

			//write into db
			var studentObj = Data.makeObj(Data.Student, studentData);
			var index = searchExisted(studentObj["course"], courseData["name"]);
			if(index >= 0){	//existed
				if(typeof body["suspend"] == 'string'){
					studentObj["course"][index]["suspend"] = Data.toBOOL(body["suspend"]);
				}
			}
			else{
				var newAttendtion = {
					"name": courseData["name"],
					"absentData": [],
					"suspend": false
				};

				if(typeof body["suspend"] == 'string'){
					newAttendtion["suspend"] = Data.toBOOL(body["suspend"]);
				}

				studentObj["course"].push(newAttendtion);
			}

			//write to student table
			var wResult1 = DB_api.write(TABLE_NAME, studentObj);

			//write to course table
			var courseObj = Data.makeObj(Data.Course, courseData);
			if(searchExisted(courseObj["students"], studentData["name"]) == null){	//ignore if existed
				var newStudent = {
					"name": studentData["name"]
				}
				courseObj["students"].push(newStudent);
			}

			var wResult2 = DB_api.write(course.tableName, courseObj);

			Promise.all([wResult1, wResult2]).then(() => {
				resolve();
			}, err => {
				//bug: restore db?
				reject("ERR_FORBIDDEN");
			});
		}, err => {
			console.log("attendCourse catch");
			reject("ERR_NOTFOUND");
		});

	});
}

//bug: this is a temp function
function leaveCourse(body){
/*	console.log(body);
	return new Promise((resolve, reject) => {
		//find student obj
		var getKey = {
			"name": body["name"]
		};
		var result1 = getData(getKey);

		//find course obj
		var courseKey = {
			"name": body["courseName"]
		}
		var result2 = course.getCourse(courseKey);

		Promise.all([result1, result2]).then(dataArray => {
			var studentData = dataArray[0];
			var courseData = dataArray[1];
			var index = null;

			var searchExisted = function(obj, key){
				var found = null;

				for(let i in obj){
					if( obj[i]["name"] == key){
						found = i;
						break;
					}
				}
				return found;
			};

			//write into db
			var studentObj = Data.makeObj(Data.Student, studentData);
			var index = searchExisted(studentObj["course"], courseData["name"]);
			if(index >= 0){	//existed
				if(typeof body["suspend"] == 'string'){
					studentObj["course"][index]["suspend"] = Data.toBOOL(body["suspend"]);
				}
			}
			else{
				var newAttendtion = {
					"name": courseData["name"],
					"absentData": [],
					"suspend": false
				};

				if(typeof body["suspend"] == 'string'){
					newAttendtion["suspend"] = Data.toBOOL(body["suspend"]);
				}

				studentObj["course"].push(newAttendtion);
			}

			//write to student table
			var wResult1 = DB_api.write(TABLE_NAME, studentObj);

			//write to course table
			var courseObj = Data.makeObj(Data.Course, courseData);
			if(searchExisted(courseObj["students"], studentData["name"]) == null){	//ignore if existed
				var newStudent = {
					"name": studentData["name"]
				}
				courseObj["students"].push(newStudent);
			}

			var wResult2 = DB_api.write(course.tableName, courseObj);

			Promise.all([wResult1, wResult2]).then(() => {
				resolve();
			}, err => {
				//bug: restore db?
				reject("ERR_FORBIDDEN");
			});
		}, err => {
			console.log("attendCourse catch");
			reject("ERR_NOTFOUND");
		});

	});*/
}

function addAbsentee(body){
	return new Promise((resolve, reject) => {
		//check
		if(typeof body["absentDate"] != 'string'){
			return reject("ERR_FORBIDDEN");
		}
		var absentDate = body["absentDate"];
		
		//find student obj
		var getKey = {
			"name": body["name"]
		};
		var result1 = getData(getKey);

		//find course obj
		var courseKey = {
			"name": body["courseName"]
		}
		var result2 = course.getCourse(courseKey);

		Promise.all([result1, result2]).then(dataArray => {
			var studentData = dataArray[0];
			var courseData = dataArray[1];
			var index = null;

			var searchExisted = function(obj, key){
				var found = null;

				for(let i in obj){
					if( obj[i]["name"] == key){
						found = i;
						break;
					}
				}
				return found;
			};

			//check student has attended the course
			var studentObj = Data.makeObj(Data.Student, studentData);
			var index = searchExisted(studentObj["course"], courseData["name"]);
			if(index == null){
				return reject("ERR_NOTFOUND");
			}
			var dateArray = studentObj["course"][index]["absentDate"];
			if(typeof dateArray == 'undefined'){
				studentObj["course"][index]["absentDate"] = [absentDate];
			}
			else if(dateArray.indexOf(absentDate) >= 0){
				return resolve();
			}
			else{
				dateArray.push(absentDate);
			}

			//write to student table
			DB_api.write(TABLE_NAME, studentObj).then(() => {
				resolve();
			}).catch(err => {
				console.log("absent write error");
				reject("ERR_FORBIDDEN");
			});
		}, err => {
			console.log("addAbsentee catch");
			reject("ERR_NOTFOUND");
		});

	});
}

function cancelAbsentee(body){
	return new Promise((resolve, reject) => {
		//check
		if(typeof body["absentDate"] != 'string'){
			return reject("ERR_FORBIDDEN");
		}
		var absentDate = body["absentDate"];
		
		//find student obj
		var getKey = {
			"name": body["name"]
		};
		var result1 = getData(getKey);

		//find course obj
		var courseKey = {
			"name": body["courseName"]
		}
		var result2 = course.getCourse(courseKey);

		Promise.all([result1, result2]).then(dataArray => {
			var studentData = dataArray[0];
			var courseData = dataArray[1];
			var index = null;

			var searchExisted = function(obj, key){
				var found = null;

				for(let i in obj){
					if( obj[i]["name"] == key){
						found = i;
						break;
					}
				}
				return found;
			};

			//check student has attended the course
			var studentObj = Data.makeObj(Data.Student, studentData);
			var index = searchExisted(studentObj["course"], courseData["name"]);
			if(index == null){
				return reject("ERR_NOTFOUND");
			}


			var dateArray = studentObj["course"][index]["absentDate"];
			if(typeof dateArray == 'undefined'){
				return resolve();
			}
			var dateIndex = dateArray.indexOf(absentDate);
			if(dateIndex < 0){
				return resolve();
			}
			else{
				dateArray.splice(dateIndex, 1);
			}

			//write to student table
			DB_api.write(TABLE_NAME, studentObj).then(() => {
				resolve();
			}).catch(err => {
				console.log("cancel absent write error");
				reject("ERR_FORBIDDEN");
			});
		}, err => {
			console.log("cancel Absentee catch");
			reject("ERR_NOTFOUND");
		});

	});
}

//============= routing =====================
function route_data(app){
	let userAPI = express.Router();

	userAPI.route('/').get((req, res) => {
		apiResponse(getData(req.query), res);
	}).post((req, res) => {
		apiResponse(writeData(req.body), res);
	}).delete((req, res) => {
		apiResponse(deleteData(req.body), res);
	});

	userAPI.route('/course').post((req, res) => {
		apiResponse(attendCourse(req.body), res);
	}).delete((req, res) => {
		console.log("delete student course");
		
	}).put((req, res) => {
		apiResponse(attendCourse(req.body), res);
	});
	
	userAPI.route('/course/attendtion').post((req, res) => {
		apiResponse(addAbsentee(req.body), res);
	}).delete((req, res) => {
		apiResponse(cancelAbsentee(req.body), res);
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
