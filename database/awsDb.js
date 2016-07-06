var AWS = require('aws-sdk'); 

AWS.config.update({
  region: "us-west-2",
  endpoint: "https://dynamodb.us-west-2.amazonaws.com"
//  endpoint: "http://localhost:8000"
});

var dynamodb = new AWS.DynamoDB();
var docClient = new AWS.DynamoDB.DocumentClient()

var TypeTranslation = {
	"Number": "N",
	"String": "S",
	"Bool": "B"
}

function writeTable(tableName, data){
	var params = {
        TableName: tableName,
        Item: data
    };

	var result = new Promise((resolve, reject) => {
		docClient.put(params, function(err, resData) {
			if (err) {
				console.error("Unable to add data. Error JSON:", JSON.stringify(err, null, 2));
				reject();
			} else {
				console.log("PutItem succeeded:", data);
				resolve();
			}
		});
	});
	return result;
}

function readTable(tableName, key){
	var params = {
		TableName: tableName,
		Key: key
	};

	var result = new Promise((resolve, reject) => {
		docClient.get(params, function(err, data) {
			if (err) {
				console.error("Unable to read item. Error JSON:", JSON.stringify(err, null, 2));
				reject();
			} else {
				console.log("GetItem succeeded:", JSON.stringify(data, null, 2));
				resolve(data);
			}
		});
	});
	return result;
}

function scanTable(tableName){
	var params = {
		TableName: tableName
		//ProjectionExpression: "#yr, title, info.rating"
	};

	return new Promise((resolve, reject) => {
		var objList = [];
		docClient.scan(params, onScan);

		function onScan(err, data) {
			if (err) {
				console.error("Unable to scan the table. Error JSON:", JSON.stringify(err, null, 2));
				reject();
			} else {
				// print all the items
				console.log("Scan succeeded.");
				
				data.Items.forEach(function(obj) {
					objList.push(obj);
				});

				// continue scanning if we have more items
				if (typeof data.LastEvaluatedKey != "undefined") {
					console.log("Scanning for more...");
					params.ExclusiveStartKey = data.LastEvaluatedKey;
					docClient.scan(params, onScan);
				}
				else
				{
					resolve(objList);
				}
			}
		}

	});
}

function createTable(tableName, schema, pk){
	
	var params = {
		TableName : tableName,
		KeySchema: [],
	    AttributeDefinitions: [],
	    ProvisionedThroughput: {       
			ReadCapacityUnits: 5, 
			WriteCapacityUnits: 5
	    }
	};

	//KeySchema
	if(schema[pk] == 'undefined')
	{
		return;
	}
	var pkSchema = {
		AttributeName: pk,
		KeyType: "HASH"
	}
	params.KeySchema.push(pkSchema);

	//AttributeDefinitions
	for(var attr in schema){
		var type = TypeTranslation[schema[attr]];
		if(type == 'undefined')
		{
			continue;
		}
		var definition = {
			AttributeName: attr,
			AttributeType: type
		}
		params.AttributeDefinitions.push(definition);
	}

	console.log("create table "+ tableName +" into aws....");

	var result = new Promise((resolve, reject) => {
		dynamodb.createTable(params, (err, data) => {
			if (err)
			{
				console.error("Unable to create table. Error JSON:", JSON.stringify(err, null, 2));
				reject();
			}
			else
			{
				console.log("Created table. Table description JSON:", JSON.stringify(data, null, 2));
				resolve();
			}
		});
	});
	return result;
}

exports.createTable = createTable;
exports.readTable = readTable;
exports.scanTable = scanTable;
exports.writeTable = writeTable;