// const axios = require('axios')
// const url = 'http://checkip.amazonaws.com/';


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
 exports.getWaterConsumptionByDog = async (event, context) => {

  const region = 'eu-west-2';
  let queryManager = new QueryManager()
  let dbManager = new DynamoDBManager(region)

  let statusCode = 200

  let result = await dbManager.executeExecuteStatement(queryManager.getWaterConsumptionByDog("DOG#c02","22135489940","22135489945"));
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
  
    let result = await dbManager.executeExecuteStatement(queryManager.getFoodConsumptionByDog("DOG#c02","22135489940","22135489945"));
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
        dogs.array.forEach(element => {
            let ranges = await dbManager.executeExecuteStatement(queryManager.getDogWaterRanges(element));
            let values = await dbManager.executeExecuteStatement(queryManager.getWaterConsumptionByDog(element,today,tomorrow));
            let sum = values.reduce((acc,newEl) => acc+newEl)
            if(sum < ranges[0].daily_water_lower_bound ||  sum > ranges[0].daily_water_upper_bound ){
                //TODO SEND WEBSITE NOTIFY
            }
        });
        return "Success"
    } catch (err) {
        return "Error"
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
          console.error(`An exception occurred, investigate and configure retry strategy. Error: ${JSON.stringify(err)}`);
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
            WHERE contains(PK, 'DOG#${dog}')
            AND contains(SK, '#PROFILE#')`
          } 
      }


    query2(daily_water_lower_bound,daily_water_upper_bound) {
      return {
          "Statement" :
          "SELECT * FROM dogs_logs WHERE contains(PK, 'LOG#wcons') AND contains(SK, 'DOG#c02') AND (time_stamp BETWEEN '22135489941' AND '22135489943') AND val BETWEEN "+ daily_water_lower_bound +" AND "+ daily_water_upper_bound
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
          WHERE contains(PK, '"${type}"')
          AND contains(SK, '"${dog}"') 
          AND (time_stamp BETWEEN '"${lowerTimeS}"' 
          AND '"${upperTimeS}"')`
        } 
    }
  
    getFoodConsumptionByDog(dog,lowerTimeS,upperTimeS) {
      return this.getConsumptionByDog("LOG#fcons",dog,lowerTimeS,upperTimeS)
    }
  }
    
  