var Aws = require("./awsDb.js");

/* 
Schema format
{
	key: type,
	...
}
*/

function createTable(tableName, schema, pk){
	console.log("create table: "+tableName);
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
		Aws.readData(tableName, key).then((data) => {
			resolve(data);
		}).catch(() => {
			reject();
		});
	});
}

function write(tableName, data){
	return new Promise((resolve, reject) => {
		Aws.writeData(tableName, data).then(() => {
			resolve();
		}).catch((err) => {
			reject();
		});
	});
}

function deleteData(tableName, data){
	return new Promise((resolve, reject) => {
		Aws.deleteData(tableName, data).then(() => {
			resolve();
		}).catch((err) => {
			reject();
		});
	});
}

function initTable(tableSchemas){
	var tableList = [];

	return new Promise((resolve, reject) => {
		Aws.listTables().then((tablesInDB) => {
			//console.log(tablesInDB);

			for(var tableName in tableSchemas){
				var found = false;
				for(var dbI in tablesInDB){
					if(tableName == tablesInDB[dbI]){
						found = true;
						break;
					}
				}

				//if not found ==> create
				if(found == false){
					createTable(tableName, tableSchemas[tableName], Object.keys(tableSchemas[tableName])[0]);
				}
			}

			//bug: must wait all createTable done
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
exports.delete = deleteData;
exports.initTable = initTable;