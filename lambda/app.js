//----------------------------------------------------------------------------------------------------------------
//-------------------------------------------------UTILS-CALSS----------------------------------------------------
//----------------------------------------------------------------------------------------------------------------

class DynamoDBManager {
	constructor(regionName) {
		this.region = regionName;
		this.aws = require('aws-sdk');
		this.aws.config.update({
			region: regionName
		});
		this.dynamoDbClient = new this.aws.DynamoDB();
	}

	async putItemInDB(obj) {
		await this.dynamoDbClient.putItem(obj).promise()
	}

	async deleteItemFromDB(obj) {
		await this.dynamoDbClient.deleteItem(obj).promise()
	}

	async executeExecuteStatement(executeStatementInput) {
		// Call DynamoDB's executeStatement API
		try {
			const executeStatementOutput = await this.dynamoDbClient.executeStatement(executeStatementInput).promise();
			console.info('ExecuteStatement executed successfully.');
			return executeStatementOutput.Items.map(val => this.aws.DynamoDB.Converter.unmarshall(val))
			// Handle executeStatementOutput
		} catch (err) {
			this.handleExecuteStatementError(err);
			return null
		}
	}

	// Handles errors during ExecuteStatement execution. Use recommendations in error messages below to 
	// add error handling specific to your application use-case. 
	handleExecuteStatementError(err) {
		if (!err) {
			console.error('Encountered error object was empty');
			return;
		}
		if (!err.code) {
			console.error(`An exception occurred, investigate and configure retry strategy. Error: ${err}`);
			return;
		}
		switch (err.code) {
			case 'ConditionalCheckFailedException':
				console.error(`Condition check specified in the operation failed, review and update the condition check before retrying. Error: ${err.message}`);
				return;
			case 'TransactionConflictException':
				console.error(`Operation was rejected because there is an ongoing transaction for the item, generally safe to retry ' +
       'with exponential back-off. Error: ${err.message}`);
				return;
			case 'ItemCollectionSizeLimitExceededException':
				console.error(`An item collection is too large, you're using Local Secondary Index and exceeded size limit of` +
					`items per partition key. Consider using Global Secondary Index instead. Error: ${err.message}`);
				return;
			default:
				break;
				// Common DynamoDB API errors are handled below
		}
		this.handleCommonErrors(err);
	}

	handleCommonErrors(err) {
		switch (err.code) {
			case 'InternalServerError':
				console.error(`Internal Server Error, generally safe to retry with exponential back-off. Error: ${err.message}`);
				return;
			case 'ProvisionedThroughputExceededException':
				console.error(`Request rate is too high. If you're using a custom retry strategy make sure to retry with exponential back-off. ` +
					`Otherwise consider reducing frequency of requests or increasing provisioned capacity for your table or secondary index. Error: ${err.message}`);
				return;
			case 'ResourceNotFoundException':
				console.error(`One of the tables was not found, verify table exists before retrying. Error: ${err.message}`);
				return;
			case 'ServiceUnavailable':
				console.error(`Had trouble reaching DynamoDB. generally safe to retry with exponential back-off. Error: ${err.message}`);
				return;
			case 'ThrottlingException':
				console.error(`Request denied due to throttling, generally safe to retry with exponential back-off. Error: ${err.message}`);
				return;
			case 'UnrecognizedClientException':
				console.error(`The request signature is incorrect most likely due to an invalid AWS access key ID or secret key, fix before retrying. ` +
					`Error: ${err.message}`);
				return;
			case 'ValidationException':
				console.error(`The input fails to satisfy the constraints specified by DynamoDB, ` +
					`fix input before retrying. Error: ${err.message}`);
				return;
			case 'RequestLimitExceeded':
				console.error(`Throughput exceeds the current throughput limit for your account, ` +
					`increase account level throughput before retrying. Error: ${err.message}`);
				return;
			default:
				console.error(`Unexpected error encountered::${err.code}`);
				return;
		}
	}
}


class QueryManager {
	constructor() {}
	updateLastVitalParams(chip_id, type, value) {
		return {
			"Statement": `UPDATE dogs_logs
          SET last_${type}=${value} 
          WHERE PK='DOG#${chip_id}' AND SK='#PROFILE#${chip_id}'`
		}
	}
	setVitalParamRangesByDog(chip_id, u_bound, l_bound, type) {
		return {
			"Statement": `UPDATE dogs_logs
            SET ${type}_upper_bound =${u_bound} 
            SET ${type}_lower_bound =${l_bound} 
            WHERE PK='DOG#${chip_id}' AND SK='#PROFILE#${chip_id}'`
		}
	}
	changeStatus(chip_id, status) {
		return {
			"Statement": `UPDATE dogs_logs
        SET "status"='${status}' 
        WHERE PK='DOG#${chip_id}' AND SK='#PROFILE#${chip_id}'`
		}
	}
	deleteDog(chip_id) {
		return {
			"Statement": `DELETE FROM dogs_logs
        WHERE PK = 'DOG#${chip_id}' AND SK = '#PROFILE#${chip_id}'`
		}
	}
	changeCage(chip_id, new_cage) {
		return {
			"Statement": `UPDATE dogs_logs
        SET "cage_id"=${new_cage} 
        WHERE PK='DOG#${chip_id}' AND SK='#PROFILE#${chip_id}'`
		}
	}
	insertDog(chip_id, name, size, status, cage) {
		return {
			"Statement": `INSERT INTO dogs_logs value {          
          'PK' : 'DOG#${chip_id}', 
          'SK' : '#PROFILE#${chip_id}',
          'chip_id': '${chip_id}',
          'name': '${name}',
          'size': '${size}',
          'status': '${status}',
          'cage_id': '${cage}'}`
		}
	}
	setConsRangesByDog(chip_id, u_bound, l_bound, type) {
		return {
			"Statement": `UPDATE dogs_logs
            SET daily_${type}_upper_bound =${u_bound} 
            SET daily_${type}_lower_bound =${l_bound} 
            WHERE PK='DOG#${chip_id}' AND SK='#PROFILE#${chip_id}'`
		}
	}
	getLastTempHbByDog(chip_id) {
		return {
			"Statement": `SELECT last_hb, last_temp
          FROM dogs_logs
          WHERE PK='DOG#${chip_id}' AND SK='#PROFILE#${chip_id}'`
		}
	}
	getUsersByRole(role) {
		return {
			"Statement": `SELECT *
        FROM dogs_logs
        WHERE contains(PK,'USER#') AND contains(SK,'#PROFILE#') AND contains(roles, '${role}')`
		}
	}
	getRolesByUser(username) {
		return {
			"Statement": `SELECT roles
        FROM dogs_logs
        WHERE PK='USER#${username}' AND contains(SK,'#PROFILE#')`
		}
	}
	getDogsBySize(size) {
		return {
			"Statement": `SELECT PK, chip_id
            FROM dogs_logs
            WHERE dog_size = ${size}`
		}
	}
	getDogs() {
		return {
			"Statement": `SELECT *
            FROM dogs_logs
            WHERE contains(PK, 'DOG#') AND contains(SK, '#PROFILE#')`
		}
	}
	getDogsWithWaterRange() {
		return {
			"Statement": `SELECT PK
            FROM dogs_logs
            WHERE contains(PK, 'DOG#') 
            AND contains(SK, '#PROFILE#') 
            AND daily_water_lower_bound>0 
            AND daily_water_upper_bound<3000`
		}
	}
	getDogWaterRanges(dog) {
		return {
			"Statement": `SELECT daily_water_upper_bound, daily_water_lower_bound 
            FROM dogs_logs 
            WHERE contains(PK, '${dog}')
            AND contains(SK, '#PROFILE#')`
		}
	}
	getDogsWithFoodRange() {
		return {
			"Statement": `SELECT PK
            FROM dogs_logs
            WHERE contains(PK, 'DOG#') 
            AND contains(SK, '#PROFILE#') 
            AND daily_food_lower_bound>0 
            AND daily_food_upper_bound<3000`
		}
	}
	getDogFoodRanges(dog) {
		return {
			"Statement": `SELECT daily_food_upper_bound, daily_food_lower_bound 
            FROM dogs_logs 
            WHERE contains(PK, '${dog}')
            AND contains(SK, '#PROFILE#')`
		}
	}
	getEnvLogsInRange(lower_timestamp, upper_timestamp, type) {
		return {
			"Statement": `SELECT * 
            FROM dogs_logs 
            WHERE contains(PK,'ENV#${type}')
            AND time_stamp BETWEEN '${lower_timestamp}' AND '${upper_timestamp}'`
		}
	}
	getLogsByDog(type, dog, lowerTimeS, upperTimeS) {
		return {
			"Statement": `SELECT val,time_stamp 
          FROM dogs_logs 
          WHERE contains(PK, 'LOG#${type}') 
          AND contains(SK, '${dog}') 
          AND (time_stamp BETWEEN '${lowerTimeS}' 
          AND '${upperTimeS}')`
		}
	}
	saveDetection(chip_id, value, time, type) {
		return {
			"Statement": `INSERT INTO 
            dogs_logs value {
            'PK' : 'LOG#${type}#${time}',
            'SK' : 'DOG#${chip_id}', 
            'chip_id': '${chip_id}',
            'time_stamp': '${time}', 
            'type': '${type}', 
            'val': ${value}}`
		}
	}
}

class HttpRespose {
	constructor() {}
	success(statusCode = 200, payload = {
		"Result": ""
	}) {
		switch (payload) {
			case null:
			case "":
				statusCode = 500;
				break;
		}
		return {
			statusCode: statusCode,
			body: JSON.stringify(payload),
			headers: {
				"Access-Control-Allow-Origin": "*",
				"Access-Control-Allow-Methods": "*"
			},
		};
	}
}

//----------------------------------------------------------------------------------------------------------------
//-------------------------------------------------CONSTANTS------------------------------------------------------
//----------------------------------------------------------------------------------------------------------------

const tableName = "dogs_logs"
const region = 'eu-west-2';
const apiGatewayEndpoint = "c07eionjgd.execute-api.eu-west-2.amazonaws.com/Prod";

const queryManager = new QueryManager()
const dbManager = new DynamoDBManager(region)
const httpRespose = new HttpRespose()

//Useful for get parameters
//console.log(event.pathParameters)
//console.log(event.queryStringParameters)


/**
 *
 * Event doc: https://docs.aws.amazon.com/apigateway/latest/developerguide/set-up-lambda-proxy-integrations.html#api-gateway-simple-proxy-for-lambda-input-format
 * @param {Object} event - API Gateway Lambda Proxy Input Format
 *
 * Context doc: https://docs.aws.amazon.com/lambda/latest/dg/nodejs-prog-model-context.html 
 * @param {Object} context
 *
 * Return doc: https://docs.aws.amazon.com/apigateway/latest/developerguide/set-up-lambda-proxy-integrations.html
 * @returns {Object} object - API Gateway Lambda Proxy Output Format
 * 
 */


//----------------------------------------------------------------------------------------------------------------
//-------------------------------------------------FUNCTIONS------------------------------------------------------
//----------------------------------------------------------------------------------------------------------------

/*{
    "time_low": '2021-08-09T11:15:36'
    "time_up": '2021-09-08T16:16:08'
    "type": 'hum' 
    (allowed types: hum, temp)
}*/
exports.getEnvironmentLogs = async(event, context) => {
	let statusCode = 200
	let result
	if (event.queryStringParameters.lowerT && event.queryStringParameters.upperT && event.queryStringParameters.type) {
		result = await dbManager.executeExecuteStatement(queryManager.getEnvLogsInRange(event.queryStringParameters.lowerT, event.queryStringParameters.upperT, event.queryStringParameters.type));
		console.info('ExecuteStatement API call has been executed.')
	} else {
		statusCode = 500;
	}

	const response = httpRespose.success(statusCode, result)

	return response
};

/*{
  role: 'vet'
} */
exports.getUsersByRole = async(event, context) => {
	let result
	let statusCode = 200
	if (event.queryStringParameters.role) {
		result = await dbManager.executeExecuteStatement(queryManager.getUsersByRole(event.queryStringParameters.role));
		console.info('ExecuteStatement API call has been executed.')
	} else {
		statusCode = 500;
	}

	const response = httpRespose.success(statusCode, result)

	return response
};

/*{
  "topic" :"AWS",
  "payload" : {"A":"b","B":"b"}
}*/
exports.sendMsgToMQTT = async(event, context) => {
	const accountSpecificID = 'a2u7mhrmzu8qr6-ats';
	let statusCode = 500
	var AWS = require('aws-sdk');

	console.log("Event => " + JSON.stringify(event));
	var body = JSON.parse(event.body)
	if (typeof event.body.topic !== "undefined" && typeof event.body.payload !== "undefined") {
		var iotdata = new AWS.IotData({
			endpoint: `${accountSpecificID}.iot.${region}.amazonaws.com`
		});
		statusCode = 200
		console.log("Event => " + body.topic);
		console.log("Event => " + body.payload);
		var params = {
			topic: body.topic,
			payload: JSON.stringify(body.payload),
			qos: 1
		};

		iotdata.publish(params, function (err, data) {
			if (err) {
				console.log("ERROR => " + JSON.stringify(err));
				statusCode = 500
			} else {
				console.log("Success");
			}
		}).promise();
	}
	const response = httpRespose.success(statusCode)
	return response
}

/*{
  username: 'ciccio01'
} */
exports.getRolesByUser = async(event, context) => {
	let result
	let statusCode = 200

	if (event.queryStringParameters.username) {
		result = await dbManager.executeExecuteStatement(queryManager.getRolesByUser(event.queryStringParameters.username));
		console.info('ExecuteStatement API call has been executed.')
	} else {
		statusCode = 500;
	}

	const response = httpRespose.success(statusCode, result)

	return response
};

exports.getDogs = async(event, context) => {
	let statusCode = 200
	let result = await dbManager.executeExecuteStatement(queryManager.getDogs());
	console.info('ExecuteStatement API call has been executed.')

	const response = httpRespose.success(statusCode, result)

	return response
};

/*{
  "dog": 'c02'
} */
exports.getLastVitalParamsValByDog = async(event, context) => {
	let result
	let statusCode = 200

	if (event.queryStringParameters.dog) {
		result = await dbManager.executeExecuteStatement(queryManager.getLastTempHbByDog(event.queryStringParameters.dog));
		console.info('ExecuteStatement API call has been executed.')
	} else {
		statusCode = 500;
	}

	const response = httpRespose.success(statusCode, result)

	return response
};

/*payload={
  "chip_id": c02,
  "status": "curing"
}*/
exports.updateDogStatus = async(event, context) => {
	var parsed = JSON.parse(event.body)
	let statusCode = 200

	await dbManager.executeExecuteStatement(queryManager.changeStatus(parsed.chip_id, parsed.status));

	console.info('ExecuteStatement API call has been executed.')

	const response = httpRespose.success(statusCode)

	return response
};

/*'chip_id': c05,
  'name': 'Bob',
  'size': 3,
  'status': 'healthy',
  'cage': 57
*/
exports.insertNewDog = async(event, context) => {
	var parsed = JSON.parse(event.body)
	let statusCode = 200
	await dbManager.executeExecuteStatement(queryManager.insertDog(parsed.chip_id, parsed.name, parsed.size, parsed.status, parsed.cage));

	console.info('ExecuteStatement API call has been executed.')

	const response = httpRespose.success(statusCode)

	return response
};

/*{
    "lower_bound": 36
    "upper_bound": 41
    "dog_size": 3
    "type": 'heartbeat'
}*/
exports.setVitalParamRangesBySize = async(event, context) => {
	var parsed = JSON.parse(event.body)
	let statusCode = 200
	let dogs = await dbManager.executeExecuteStatement(queryManager.getDogsBySize(parsed.size));

	for (const el of dogs) {
		await dbManager.executeExecuteStatement(queryManager.setVitalParamRangesByDog(el.chip_id, parsed.upper_bound, parsed.lower_bound, parsed.type));

	}
	console.info('ExecuteStatement API call has been executed.')

	const response = httpRespose.success(statusCode)

	return response
};


/*{
    "chip_id": 'c02'
    "lower_bound": 36
    "upper_bound": 40
    "type": 'heartbeat'
}*/
exports.setVitalParamRangesByDog = async(event, context) => {
	var parsed = JSON.parse(event.body)
	let statusCode = 200
	await dbManager.executeExecuteStatement(queryManager.setVitalParamRangesByDog(parsed.chip_id, parsed.upper_bound, parsed.lower_bound, parsed.type));

	console.info('ExecuteStatement API call has been executed.')

	const response = httpRespose.success(statusCode)
	return response
};


/*{
    "chip_id": 'c02'
    "lower_bound": 36
    "upper_bound": 40
    "type": 'water'
}*/
exports.setConsRangesByDog = async(event, context) => {
	var parsed = JSON.parse(event.body)
	let statusCode = 200
	await dbManager.executeExecuteStatement(queryManager.setConsRangesByDog(parsed.chip_id, parsed.upper_bound, parsed.lower_bound, parsed.type));

	console.info('ExecuteStatement API call has been executed.')

	const response = httpRespose.success(statusCode)
	return response
};


/*{
    "size": 3
    "lower_bound": 36
    "upper_bound": 40
    "type": 'water'
}*/
exports.setConsRangesBySize = async(event, context) => {
	var parsed = JSON.parse(event.body)
	let statusCode = 200
	let dogs = await dbManager.executeExecuteStatement(queryManager.getDogsBySize(parsed.size));

	for (const el of dogs) {
		await dbManager.executeExecuteStatement(queryManager.setConsRangesByDog(el.chip_id, parsed.upper_bound, parsed.lower_bound, parsed.type));

	}
	console.info('ExecuteStatement APIs call has been executed.')

	const response = httpRespose.success(statusCode)

	return response
};

/* payload {
  "chip_id": 'c04',
}
 */
exports.removeDog = async(event, context) => {
	let statusCode = 200
	var parsed = JSON.parse(event.body)
	await dbManager.executeExecuteStatement(queryManager.deleteDog(parsed.chip_id));


	console.info('ExecuteStatement API call has been executed.')

	const response = httpRespose.success(statusCode)

	return response
};

/*payload {
    "chip_id": 'c01'
    "new_cage": 40
}*/
exports.transferDog = async(event, context) => {
	let statusCode = 200
	var parsed = JSON.parse(event.body)
	await dbManager.executeExecuteStatement(queryManager.changeCage(parsed.chip_id, parsed.new_cage));

	console.info('ExecuteStatement API call has been executed.')

	const response = httpRespose.success(statusCode)
	return response
};

/*payload {
    "chip_id": 'c02'
    "time": '12:00'
    "grams": 320
}*/
exports.setFoodScheduleByDog = async(event, context) => {
	const AWS = require('aws-sdk')
	let statusCode = 200
	var parsed = JSON.parse(event.body)

	const data = {
		"PK": `SCHED#${parsed.time}`,
		"SK": `DOG#${parsed.chip_id}`,
		"chip_id": parsed.chip_id,
		"grams": parsed.grams,
		"schedule_time": parsed.time
	}
	const marshalledData = AWS.DynamoDB.Converter.marshall(data)
	const params = {
		"TableName": tableName,
		"Item": marshalledData,
	}

	await dbManager.putItemInDB(params)

	console.info('ExecuteStatement API call has been executed.')

	const response = httpRespose.success(statusCode)

	return response
};


/*{
    "size": 3
    "time": '12:00'
    "grams": 320
}*/
exports.setFoodScheduleBySize = async(event, context) => {
	const AWS = require('aws-sdk')
	let statusCode = 200
	var parsed = JSON.parse(event.body)
	let dogs = await dbManager.executeExecuteStatement(queryManager.getDogsBySize(parsed.size));

	for (const el of dogs) {
		const data = {
			"PK": `SCHED#${parsed.time}`,
			"SK": el.PK,
			"chip_id": el.chip_id,
			"grams": parsed.grams,
			"schedule_time": parsed.time
		}
		const marshalledData = AWS.DynamoDB.Converter.marshall(data)
		const params = {
			"TableName": tableName,
			"Item": marshalledData,
		}

		await dbManager.putItemInDB(params)

	}
	console.info('ExecuteStatement API call has been executed.')

	const response = httpRespose.success(statusCode)
	return response
};

/*{
    "chip_id": 'c02'
    "upperT": '12:00'
    "lowerT": 320
    "type": 'hb'
}*/
exports.getLogsByDog = async(event, context) => {
	let result
	let statusCode = 200

	console.log(event.queryStringParameters)
	if (event.queryStringParameters.lowerT && event.queryStringParameters.upperT) {
		result = await dbManager.executeExecuteStatement(queryManager.getLogsByDog(event.queryStringParameters.type, `DOG#${event.queryStringParameters.dog}`, event.queryStringParameters.lowerT, event.queryStringParameters.upperT));
		console.info('ExecuteStatement API call has been executed.')
	} else {
		statusCode = 500;
	}

	const response = httpRespose.success(statusCode, result)

	return response
};

exports.getTotalCosumption = async(event, context) => {
	var statusCode = 200

	if (event.queryStringParameters.lowerT && event.queryStringParameters.upperT && event.queryStringParameters.dog) {
		var data = event.queryStringParameters
		var waterConsumption = 0
		var foodConsumption = 0
		try {
			waterConsumption = await dbManager.executeExecuteStatement(queryManager.getLogsByDog("wcons", data.dog, data.lowerT, data.upperT))
			foodConsumption = await dbManager.executeExecuteStatement(queryManager.getLogsByDog("fcons", data.dog, data.lowerT, data.upperT))
			if (Object.values(waterConsumption).length > 0) {
				waterConsumption = Object.values(waterConsumption).map(el => el.val).reduce((acc, nextEL) => nextEL + acc)
			} else {
				waterConsumption = 0
			}
			if (Object.values(foodConsumption).length > 0) {
				foodConsumption = Object.values(foodConsumption).map(el => el.val).reduce((acc, nextEL) => nextEL + acc)
			} else {
				foodConsumption = 0
			}

		} catch (err) {
			console.log(err)
			statusCode = 500;
		}
	} else {
		statusCode = 500;
	}
	const response = httpRespose.success(statusCode, {
		"waterTotal": waterConsumption,
		"foodTotal": foodConsumption
	})

	return response
};

exports.foodConsumptionAlarm = async(event, context) => {
	var today = new Date()
	var tomorrow = new Date(today)
	tomorrow.setDate(tomorrow.getDate() + 1)
	const type = 'fcons'
	today = today.toISOString().slice(0, 19)
	tomorrow = tomorrow.toISOString().slice(0, 19)

	try {
		let dogs = await dbManager.executeExecuteStatement(queryManager.getDogsWithFoodRange());
		for (const dog of dogs) {

			let ranges = await dbManager.executeExecuteStatement(queryManager.getDogFoodRanges(dog.PK));
			let values = await dbManager.executeExecuteStatement(queryManager.getLogsByDog(type, dog.PK, today, tomorrow));


			if (typeof values !== 'undefined' && values.length > 0) {
				let sum = values.map(value => value.val).reduce((acc, newEl) => acc + newEl)
				if (sum < ranges[0].daily_food_lower_bound || sum > ranges[0].daily_food_upper_bound) {

					const AWS = require('aws-sdk');

					const ddb = new AWS.DynamoDB.DocumentClient({
						apiVersion: '2012-08-10',
						region: process.env.AWS_REGION
					});

					const {
						TABLE_NAME
					} = process.env;


					let connectionData;

					try {
						connectionData = await ddb.scan({
							TableName: TABLE_NAME,
							ProjectionExpression: 'connectionId'
						}).promise();
					} catch (e) {
						return {
							statusCode: 500,
							body: e.stack
						};
					}

					const apigwManagementApi = new AWS.ApiGatewayManagementApi({
						apiVersion: '2018-11-29',
						endpoint: apiGatewayEndpoint
					});

					const postData = JSON.stringify({
						"Notify": `Allarme cane: ${dog.PK} Consumo di cibo anomalo, cibo consumato oggi: ${sum}`
					});

					const postCalls = connectionData.Items.map(async({
						connectionId
					}) => {
						try {
							await apigwManagementApi.postToConnection({
								ConnectionId: connectionId,
								Data: postData
							}).promise();
						} catch (e) {
							if (e.statusCode === 410) {
								console.log(`Found stale connection, deleting ${connectionId}`);
								await ddb.delete({
									TableName: TABLE_NAME,
									Key: {
										connectionId
									}
								}).promise();
							} else {
								throw e;
							}
						}
					});

					try {
						await Promise.all(postCalls);
					} catch (e) {
						return `\t Error \t${e.stack}`
					}
					return `\t Success \t`
				}
			}
		}
		return `\t Success \t`
	} catch (err) {
		return `\t Error ${err} \t`
	}
};

exports.waterConsumptionAlarm = async(event, context) => {
	var today = new Date()
	var tomorrow = new Date(today)
	tomorrow.setDate(tomorrow.getDate() + 1)
	const type = 'wcons'
	today = today.toISOString().slice(0, 19)
	tomorrow = tomorrow.toISOString().slice(0, 19)
	console.log(tomorrow)
	try {
		let dogs = await dbManager.executeExecuteStatement(queryManager.getDogsWithWaterRange());
		for (const el of dogs) {

			let ranges = await dbManager.executeExecuteStatement(queryManager.getDogWaterRanges(el.PK));
			let values = await dbManager.executeExecuteStatement(queryManager.getLogsByDog(type, el.PK, today, tomorrow));

			if (typeof values !== 'undefined' && values.length > 0) {
				let sum = values.map(value => value.val).reduce((acc, newEl) => acc + newEl)
				if (sum < ranges[0].daily_water_lower_bound || sum > ranges[0].daily_water_upper_bound) {

					const AWS = require('aws-sdk');

					const ddb = new AWS.DynamoDB.DocumentClient({
						apiVersion: '2012-08-10',
						region: process.env.AWS_REGION
					});

					const {
						TABLE_NAME
					} = process.env;

					let connectionData;

					try {
						connectionData = await ddb.scan({
							TableName: TABLE_NAME,
							ProjectionExpression: 'connectionId'
						}).promise();
					} catch (e) {
						return {
							statusCode: 500,
							body: e.stack
						};
					}

					const apigwManagementApi = new AWS.ApiGatewayManagementApi({
						apiVersion: '2018-11-29',
						endpoint: apiGatewayEndpoint
					});

					const postData = JSON.stringify({
						"Notify": `Allarme cane: ${dog.PK} Consumo di Acqua anomalo, cibo consumato oggi: ${sum}`
					});

					const postCalls = connectionData.Items.map(async({
						connectionId
					}) => {
						try {
							await apigwManagementApi.postToConnection({
								ConnectionId: connectionId,
								Data: postData
							}).promise();
						} catch (e) {
							if (e.statusCode === 410) {
								console.log(`Found stale connection, deleting ${connectionId}`);
								await ddb.delete({
									TableName: TABLE_NAME,
									Key: {
										connectionId
									}
								}).promise();
							} else {
								throw e;
							}
						}
					});

					try {
						await Promise.all(postCalls);
					} catch (e) {
						return `\t Error \t${e.stack}`
					}
					return `\t Success \t`
				}
			}

		}
		return `\t Success \t`
	} catch (err) {
		return `\t Error ${err} \t`
	}
};

exports.saveDetection = async(event, context) => {
	try {
		console.log(event.Type)
		console.log(event.Chip_id)
		console.log(event.Time)
		console.log(event.Value)
		await dbManager.executeExecuteStatement(queryManager.saveDetection(event.Chip_id, event.Value, event.Time, event.Type));
		if (event.type == "temp" || event.type == "hb") {
			await dbManager.executeExecuteStatement(queryManager.updateLastVitalParams(event.Chip_id, event.Type, event.Value));
		}
		console.log("Success")
		return `\t Success \t`
	} catch (err) {
		return `\t Error ${err} \t`
	}
};