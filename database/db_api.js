var Aws = require("./awsDb.js");

/* 
Schema format
{
	key: type,
	...
}
*/

function createTable(tableName, schema, pk){
	var result = new Promise((resolve, reject) => {
		Aws.createTable(tableName, schema, pk).then(() => {
			resolve();
		}).catch(() => {
			reject();
		});
	});
	return result;
}




function read(tableName){
	var result = new Promise((resolve, reject) => {
		Aws.readTable(tableName).then((data) => {
			resolve(data);
		}).catch(() => {
			reject();
		});
	});
}

function write(tableName, data){
	var result = new Promise((resolve, reject) => {
		Aws.writeTable(tableName, data).then(() => {
			resolve();
		}).catch(() => {
			reject();
		});
	});
}



exports.read = read;
exports.createTable = createTable;
exports.write = write;