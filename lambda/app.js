
const tableName = "dogs_logs"
// const axios = require('axios')
// const url = 'http://checkip.amazonaws.com/';
//JSON.stringify(ranges)+"zz\t")

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

 exports.getEnvironmentLogs = async (event, context) => {

    const region = 'eu-west-2';
    let queryManager = new QueryManager()
    let dbManager = new DynamoDBManager(region)
    let statusCode = 200
    const type = "hum" /*or temp */
    const lower_timestamp = "2021-08-09T11:15:36"
    const upper_timestamp = "2021-09-08T16:16:08"
    let result = await dbManager.executeExecuteStatement(queryManager.getEnvLogsInRange(lower_timestamp , upper_timestamp, type));  
    
    console.info('ExecuteStatement API call has been executed.')
  
    switch (result) {
        case null:
        case "":
            statusCode = 500;
            break;
    }
  
    const response = {
        statusCode: statusCode,
        body: result
    };
  
    return response
  };


 exports.setVitalParamRangesBySize = async (event, context) => {
    const AWS = require('aws-sdk')
    const region = 'eu-west-2';
    const size = 2
    const lower_bound = 36
    const upper_bound = 40
    const type = "heartbeat" /*or "temp"*/ 
    
    
    let queryManager = new QueryManager()
    let dbManager = new DynamoDBManager(region)
  
    let statusCode = 200
    let dogs = await dbManager.executeExecuteStatement(queryManager.getDogsBySize(size));
    //let result = await dbManager.executeExecuteStatement(queryManager.test());
    
    for (const el of dogs) {
        await dbManager.executeExecuteStatement(queryManager.setVitalParamRangesByDog(el.chip_id, upper_bound, lower_bound, type));
 
    }
    console.info('ExecuteStatement API call has been executed.')
  
    const response = {
        statusCode: statusCode,
        body: "ok"
    };
  
    return response
  };
  exports.setVitalParamRangesByDog = async (event, context) => {
    const AWS = require('aws-sdk')
    const region = 'eu-west-2';
    const chip_id = "c01"
    const lower_bound = 38
    const upper_bound = 42
    const type = "temp" /*or "heartbeat"*/ 
    
    
    let queryManager = new QueryManager()
    let dbManager = new DynamoDBManager(region)
  
    let statusCode = 200

    await dbManager.executeExecuteStatement(queryManager.setVitalParamRangesByDog(chip_id, upper_bound, lower_bound, type));
 
    
    console.info('ExecuteStatement API call has been executed.')
  
    const response = {
        statusCode: statusCode,
        body: "ok"
    };
  
    return response
  };
 exports.setConsRangesByDog = async (event, context) => {
    const AWS = require('aws-sdk')
    const region = 'eu-west-2';
    const chip_id = "c02"
    const upper_bound = 88
    const lower_bound = 54
    const type = "water" /*or "food" */ 
    
    
    let queryManager = new QueryManager()
    let dbManager = new DynamoDBManager(region)
  
    let statusCode = 200
    await dbManager.executeExecuteStatement(queryManager.setConsRangesByDog(chip_id, upper_bound, lower_bound, type)); 
    
    console.info('ExecuteStatement API call has been executed.')
  
    const response = {
        statusCode: statusCode,
        body: "ok"
    };
  
    return response
  };
 exports.setConsRangesBySize = async (event, context) => {
    const AWS = require('aws-sdk')
    const region = 'eu-west-2';
    const size = 2
    const upper_bound = 37
    const lower_bound = 12
    const type = "water" /*or "food"*/ 
    
    
    let queryManager = new QueryManager()
    let dbManager = new DynamoDBManager(region)
  
    let statusCode = 200
    let dogs = await dbManager.executeExecuteStatement(queryManager.getDogsBySize(size));
    //let result = await dbManager.executeExecuteStatement(queryManager.test());
    
    for (const el of dogs) {
        await dbManager.executeExecuteStatement(queryManager.setConsRangesByDog(el.chip_id, upper_bound, lower_bound, type));
 /*     const data = {
          "PK" : el.PK,
          "SK" : `#PROFILE#${el.chip_id}`,
          "daily_food_lower_bound": el.chip_id,
          "daily_food_upper_bound": grams,                
      }
      const marshalledData = AWS.DynamoDB.Converter.marshall(data)
      const params = {
          "TableName": tableName,
          "Item": marshalledData,
        }
        
      await dbManager.putItemInDB(params)*/
  
    }
    console.info('ExecuteStatement API call has been executed.')
  
    const response = {
        statusCode: statusCode,
        body: "ok"
    };
  
    return response
  };
 exports.setFoodScheduleByDog = async (event, context) => {
    const AWS = require('aws-sdk')
    const region = 'eu-west-2';
    let queryManager = new QueryManager()
    let dbManager = new DynamoDBManager(region)
  
    let statusCode = 200
    //let result = await dbManager.executeExecuteStatement(queryManager.test());
    const time = "13:00"
    const grams = 475
    const dog = "c02"
    
      const data = {
          "PK" : `SCHED#${time}`,
          "SK" : `DOG#${dog}`,
          "chip_id": dog,
          "grams": grams,
          "schedule_time": time                   
      }
      const marshalledData = AWS.DynamoDB.Converter.marshall(data)
      const params = {
          "TableName": tableName,
          "Item": marshalledData,
        }
        
      await dbManager.putItemInDB(params)

    console.info('ExecuteStatement API call has been executed.')
  
    const response = {
        statusCode: statusCode,
        body: "ok"
    };
  
    return response
  };
 exports.setFoodScheduleBySize = async (event, context) => {
  const AWS = require('aws-sdk')
  const region = 'eu-west-2';
  let queryManager = new QueryManager()
  let dbManager = new DynamoDBManager(region)

  let statusCode = 200
  let dogs = await dbManager.executeExecuteStatement(queryManager.getDogsBySize(3));
  //let result = await dbManager.executeExecuteStatement(queryManager.test());
  const time = "13:00"
  const grams = 475
  for (const el of dogs) {
    const data = {
        "PK" : `SCHED#${time}`,
        "SK" : el.PK,
        "chip_id": el.chip_id,
        "grams": grams,
        "schedule_time": time                   
    }
    const marshalledData = AWS.DynamoDB.Converter.marshall(data)
    const params = {
        "TableName": tableName,
        "Item": marshalledData,
      }
      
    await dbManager.putItemInDB(params)

  }
  console.info('ExecuteStatement API call has been executed.')

  const response = {
      statusCode: statusCode,
      body: "ok"
  };

  return response
};

exports.getWaterConsumptionByDog = async (event, context) => {

    const region = 'eu-west-2';
    let queryManager = new QueryManager()
    let dbManager = new DynamoDBManager(region)
  
    let statusCode = 200
    let result = await dbManager.executeExecuteStatement(queryManager.getWaterConsumptionByDog("DOG#c02","2021-06-04T10:30:47","2021-07-08T16:16:08"));
    //let result = await dbManager.executeExecuteStatement(queryManager.test());
  
    console.info('ExecuteStatement API call has been executed.')
  
    switch (result) {
        case null:
        case "":
            statusCode = 500;
            break;
    }
  
    const response = {
        statusCode: statusCode,
        body: result
    };
  
    return response
  };


exports.getFoodConsumptionByDog = async (event, context) => {

    const region = 'eu-west-2';
    let queryManager = new QueryManager()
    let dbManager = new DynamoDBManager(region)
  
    let statusCode = 200
  
    let result = await dbManager.executeExecuteStatement(queryManager.getFoodConsumptionByDog("DOG#c02","2021-06-04T10:30:47","2021-07-08T16:16:08"));
    console.info('ExecuteStatement API call has been executed.')
  
    switch (result) {
        case null:
        case "":
            statusCode = 500;
            break;
    }
  
    const response = {
        statusCode: statusCode,
        body: result
    };
  
    return response
  };


  exports.waterConsumptionAlarm = async (event, context) => {

    const region = 'eu-west-2';
    let queryManager = new QueryManager()
    let dbManager = new DynamoDBManager(region)
  
    var today = new Date()
    var tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)
    
    today = today.toISOString().slice(0, 19) 
    tomorrow = tomorrow.toISOString().slice(0, 19) 
    console.log(tomorrow)
    try {
        let dogs = await dbManager.executeExecuteStatement(queryManager.getDogsWithWaterRange());
        for (const el of dogs) {

            let ranges = await dbManager.executeExecuteStatement(queryManager.getDogWaterRanges(el.PK));
            let values = await dbManager.executeExecuteStatement(queryManager.getWaterConsumptionByDog(today,tomorrow));

            if (typeof values !== 'undefined' && values.length > 0) {
                let sum = values.map(value => value.val ).reduce((acc,newEl) => acc+newEl)
                if(sum < ranges[0].daily_water_lower_bound ||  sum > ranges[0].daily_water_upper_bound ){
                    //TODO SEND WEBSITE NOTIFY
                }
            }

        }
        return `\t Success \t`
    } catch (err) {
        return `\t Error ${err} \t`
    }
  };

  exports.foodConsumptionAlarm = async (event, context) => {

    const region = 'eu-west-2';
    let queryManager = new QueryManager()
    let dbManager = new DynamoDBManager(region)
  
    var today = new Date()
    var tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)
    
    today = today.toISOString().slice(0, 19) 
    tomorrow = tomorrow.toISOString().slice(0, 19) 
    console.log(tomorrow)
    try {
        let dogs = await dbManager.executeExecuteStatement(queryManager.getDogsWithFoodRange());
        for (const el of dogs) {

            let ranges = await dbManager.executeExecuteStatement(queryManager.getDogFoodRanges(el.PK));
            let values = await dbManager.executeExecuteStatement(queryManager.getFoodConsumptionByDog(today,tomorrow));

            if (typeof values !== 'undefined' && values.length > 0) {
                let sum = values.map(value => value.val ).reduce((acc,newEl) => acc+newEl)
                if(sum < ranges[0].daily_food_lower_bound ||  sum > ranges[0].daily_food_upper_bound ){
                    //TODO SEND WEBSITE NOTIFY
                }
            }

        }
        return `\t Success \t`
    } catch (err) {
        return `\t Error ${err} \t`
    }
  };

class DynamoDBManager {

  constructor(regionName) {
      this.region = regionName;
      this.aws = require('aws-sdk');
      this.aws.config.update({
          region: regionName
      });
      this.dynamoDbClient = new this.aws.DynamoDB();
  }

  async putItemInDB(obj){
    await this.dynamoDbClient.putItem(obj).promise()
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

  async executeExecuteStatement2(executeStatementInput) {
    // Call DynamoDB's executeStatement API
    try {
        const executeStatementOutput = await this.dynamoDbClient.executeStatement(executeStatementInput).promise();
        console.info('ExecuteStatement executed successfully.');
        return executeStatementOutput
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
    setVitalParamRangesByDog(chip_id, u_bound, l_bound, type) {
        return {
            "Statement" : 
            `UPDATE dogs_logs
            SET ${type}_upper_bound =${u_bound} 
            SET ${type}_lower_bound =${l_bound} 
            WHERE PK='DOG#${chip_id}' AND SK='#PROFILE#${chip_id}'`
          } 
      }
    setConsRangesByDog(chip_id, u_bound, l_bound, type) {
        return {
            "Statement" : 
            `UPDATE dogs_logs
            SET daily_${type}_upper_bound =${u_bound} 
            SET daily_${type}_lower_bound =${l_bound} 
            WHERE PK='DOG#${chip_id}' AND SK='#PROFILE#${chip_id}'`
          } 
      }
    getDogsBySize(size) {
        return {
            "Statement" : 
            `SELECT PK, chip_id
            FROM dogs_logs
            WHERE dog_size = ${size}`
          } 
      }
  
    getDogWaterRanges(dog) {
      return {
          "Statement" : 
          `SELECT daily_water_upper_bound, daily_water_lower_bound 
          FROM dogs_logs 
          WHERE contains(PK, 'DOG#${dog}')
          AND contains(SK, '#PROFILE#')`
        } 
    }
  
    getDogsWithWaterRange() {
        return {
            "Statement" : 
            `SELECT PK
            FROM dogs_logs
            WHERE contains(PK, 'DOG#') 
            AND contains(SK, '#PROFILE#') 
            AND daily_water_lower_bound>0 
            AND daily_water_upper_bound<3000`
          } 
      }

      getDogWaterRanges(dog) {
        return {
            "Statement" : 
            `SELECT daily_water_upper_bound, daily_water_lower_bound 
            FROM dogs_logs 
            WHERE contains(PK, '${dog}')
            AND contains(SK, '#PROFILE#')`
          } 
      }

      getDogsWithFoodRange() {
        return {
            "Statement" : 
            `SELECT PK
            FROM dogs_logs
            WHERE contains(PK, 'DOG#') 
            AND contains(SK, '#PROFILE#') 
            AND daily_food_lower_bound>0 
            AND daily_food_upper_bound<3000`
          } 
      }

      getDogFoodRanges(dog) {
        return {
            "Statement" : 
            `SELECT daily_food_upper_bound, daily_food_lower_bound 
            FROM dogs_logs 
            WHERE contains(PK, '${dog}')
            AND contains(SK, '#PROFILE#')`
          } 
      }


    query2(daily_water_lower_bound,daily_water_upper_bound) {
      return {
          "Statement" :
          "SELECT * FROM dogs_logs WHERE contains(PK, 'LOG#wcons') AND contains(SK, 'DOG#c02') AND (time_stamp BETWEEN '22135489941' AND '22135489943') AND val BETWEEN "+ daily_water_lower_bound +" AND "+ daily_water_upper_bound
        } 
    }


    test() {
        return {
            "Statement" :
            `SELECT * FROM dogs_logs WHERE contains(PK,'DOG#')`
          } 
      }



      
  
    getEnvLogsInRange(lower_timestamp , upper_timestamp, type){
        return {
            "Statement" : 
            `SELECT * 
            FROM dogs_logs 
            WHERE contains(PK,'ENV#${type}')
            AND time_stamp BETWEEN '${lower_timestamp}' AND '${upper_timestamp}'`
          } 
    }
    getWaterConsumptionByDog(dog,lowerTimeS,upperTimeS) {
      return this.getConsumptionByDog("LOG#wcons",dog,lowerTimeS,upperTimeS)
    }
  
    getConsumptionByDog(type,dog,lowerTimeS,upperTimeS) {
      return {
          "Statement" : 
          `SELECT val 
          FROM dogs_logs 
          WHERE contains(PK, '${type}') 
          AND contains(SK, '${dog}') 
          AND (time_stamp BETWEEN '${lowerTimeS}' 
          AND '${upperTimeS}')`
        } 
    }
  
    getFoodConsumptionByDog(dog,lowerTimeS,upperTimeS) {
      return this.getConsumptionByDog("LOG#fcons",dog,lowerTimeS,upperTimeS)
    }
  }
    
  