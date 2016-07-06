var Aws = require("./awsDb.js");

/* 
Schema format
{
	key: type,
	...
}
*/

function createTable(tableName, schema, pk){
	return new Promise((resolve, reject) => {
		Aws.createTable(tableName, schema, pk).then(() => {
			resolve();
		}).catch(() => {
			reject();
		});
	});
}
//table full scan
function scan(tableName){
	return new Promise((resolve, reject) => {
		Aws.scanTable(tableName).then((data) => {
			resolve(data);
		}).catch(() => {
			reject();
		});
	});
}

//read item by key
function read(tableName, key){
	return new Promise((resolve, reject) => {
		Aws.readTable(tableName, key).then((data) => {
			resolve(data);
		}).catch(() => {
			reject();
		});
	});
}

function write(tableName, data){
	return new Promise((resolve, reject) => {
		Aws.writeTable(tableName, data).then(() => {
			resolve();
		}).catch((err) => {
			reject();
		});
	});
}


exports.scan = scan;
exports.read = read;
exports.createTable = createTable;
exports.write = write;