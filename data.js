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
		this.weekly = "none";
		this.students = [];
	}
}


class Student {
	constructor(name){
		this.name = name;	//p.k.
		this.course = [];
	}
}

function makeObj(destClass, source){
	var dest = new destClass();

	if(typeof source != 'object'){
		return null;
	}

	var copyFunc = function(dObj, sObj){
		for(let i in dObj){
			for(let j in sObj){
				if(j == i){
					if(typeof dObj[i] == 'object'){
						if(Array.isArray(dObj[i])){
							dObj[i] = sObj[i].slice(0);
						}
						else
						{
							dObj[i] = copyFunc(dObj[i], sObj[j]);						
						}
					}

					else
					{
						dObj[i] = sObj[j];
					}
					break;
				}
			}
		}
		return dObj;
	}
	return copyFunc(dest, source);
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



//utils
function toBOOL(val)
{
	if (val==null) return false;
	switch (typeof val)
	{
		case 'boolean':
			return val;
		case 'string':
			var result = false;
			switch(val.toLowerCase())
			{
				case "true":
				case "1":
				case "on":
				case "enable":
				case "enabled":
					result = true;
					break;
			}
			return result;
		case 'number':
			return (val == 1) ? true:false;
	}
	return false;
}

function isEmpty(obj){

	if((obj == null) || 
		(obj.length === 0)){
		return true;
	}

	if(obj.length > 0)
		return false;

	for(let i in obj){
		if(obj.hasOwnProperty(i)){
			return false;
		}
	}

	return true;
}

exports.Course = Course;
exports.Student = Student;
exports.makeObj = makeObj;
exports.init = initData;

//utils
exports.toBOOL = toBOOL;
exports.isEmpty = isEmpty;