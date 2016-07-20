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

// ============== write =========================
function deleteData(req, res){
	console.log(req.body);
	var body = req.body;

	//Integrity check
	if(typeof body["name"] == 'undefined')
	{
		resopnseStatusCode("ERR_FORBIDDEN", res);
		return;
	}
	
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

	//empty check
	var getKey = {
		"name": body["name"]
	};
	DB_api.read(TABLE_NAME, getKey).then((data) => {
		var allowDelete = true;

		for(var i in data){
			console.log(i);
			console.log(data[i]["course"]);
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
			resopnseStatusCode("ERR_FORBIDDEN", res);
			//bug: quit promise chain?
		}
	}).then(() => {
		resopnseStatusCode("OK", res);
	}).catch(() => {
		resopnseStatusCode("ERR_NOTFOUND", res);
	});

}

//============= routing =====================
function route_data(app){
	var userAPI = express.Router();
	
	userAPI.route('/').get((req, res) => {
		getData(req, res);
	}).post((req, res) => {
		writeData(req, res);
	}).delete((req, res) => {
		console.log("delete class");
		deleteData(req, res);
	}).put((req, res) => {
		console.log("put class");
		res.end("");
	});

	app.use('/data/student', userAPI);
}

function resopnseStatusCode(result, res){
	console.log(resultStatus[result]);
	res.sendStatus(resultStatus[result]);
	res.end();
}


exports.start = route_data;
