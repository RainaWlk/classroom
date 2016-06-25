var express = require('express');
var connInfo = require('./connInfo.js');
var data = require('./data.js');

function route_data(app){
	var userAPI = express.Router();
	
	userAPI.route('/class').get((req, res) => {
		console.log("get class");
		res.end("");
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