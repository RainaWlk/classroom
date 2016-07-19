var DB_api = require('./database/db_api.js');


//db schemas (p.k. must be the first element)
var tableSchemas = {
	"course" : {
		"name": "String"
	},
	"students" : {
		"name": "String"
	}
};

//definition
class Course {

	constructor(name, teacher) {
		this.name = name;	//p.k.
		this.teacher = teacher;
		this.dates = [];
		this.weekly = "";
		this.students = [];
	}
}


class Student {
	constructor(name){
		this.name = name;	//p.k.
		this.course = [];
	}
}


function initData(){

	return new Promise((resolve, reject) => {
		//init tables
		DB_api.initTable(tableSchemas).then(() => {
			resolve();
		}).catch(() => {
			reject();
		});
	});
}



exports.Course = Course;
exports.Student = Student;

exports.init = initData;