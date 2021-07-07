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
 exports.handler =  async (event,context) => {
  // ------------ NodeJS runtime ---------------
  //--------------------------------------------
  
  const AWS = require('aws-sdk');
  let statusCode = 200
  // Create the DynamoDB Client with the region you want
  const region = 'eu-west-2';
  const dynamoDbClient = createDynamoDbClient(region);
  
  // Create the input for executeStatement call
  const executeStatementInput = createExecuteStatementInput();
  
   // Call DynamoDB's executeStatement API
  let result = await executeExecuteStatement(dynamoDbClient, executeStatementInput);
  console.info('ExecuteStatement API call has been executed.')
    
    switch (result) {
      case null:
      case "":
        statusCode = 500;
        break;
    }
  
   var Items = result.Items.map( res => AWS.DynamoDB.Converter.unmarshall(res))
   
   const response = {
      statusCode: statusCode,
      body: JSON.stringify(Items.map(item => item.val).reduce((acc,nextval)=> acc+nextval)),
  };
   
  console.log('Converted records', Items.body);
  
  return response
  
  //---------------------------------------------------------------------
  //---------------------------------------------------------------------
  
  
  function createDynamoDbClient(regionName) {
    // Set the region
    AWS.config.update({region: regionName});
    return new AWS.DynamoDB();
  }
  
  function createExecuteStatementInput() {
    return {
        "Statement" : 
        "SELECT val FROM dogs_logs WHERE contains(PK, 'LOG#fcons')AND contains(SK, 'DOG#c02') AND (time_stamp BETWEEN '22135489922' AND '22135489943')"
      } 
  }
  
  async function executeExecuteStatement(dynamoDbClient, executeStatementInput) {
    // Call DynamoDB's executeStatement API
    try {
      const executeStatementOutput = await dynamoDbClient.executeStatement(executeStatementInput).promise();
      console.info('ExecuteStatement executed successfully.');
      return executeStatementOutput
      // Handle executeStatementOutput
    } catch (err) {
      handleExecuteStatementError(err);
      return null
    }
  }
  
  // Handles errors during ExecuteStatement execution. Use recommendations in error messages below to 
  // add error handling specific to your application use-case. 
  function handleExecuteStatementError(err) {
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
    handleCommonErrors(err);
  }
  
  function handleCommonErrors(err) {
    switch (err.code) {
      case 'InternalServerError':
        console.error(`Internal Server Error, generally safe to retry with exponential back-off. Error: ${err.message}`);
        return;
      case 'ProvisionedThroughputExceededException':
        console.error(`Request rate is too high. If you're using a custom retry strategy make sure to retry with exponential back-off. `
          + `Otherwise consider reducing frequency of requests or increasing provisioned capacity for your table or secondary index. Error: ${err.message}`);
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
        console.error(`The request signature is incorrect most likely due to an invalid AWS access key ID or secret key, fix before retrying. `
          + `Error: ${err.message}`);
        return;
      case 'ValidationException':
        console.error(`The input fails to satisfy the constraints specified by DynamoDB, `
          + `fix input before retrying. Error: ${err.message}`);
        return;
      case 'RequestLimitExceeded':
        console.error(`Throughput exceeds the current throughput limit for your account, `
          + `increase account level throughput before retrying. Error: ${err.message}`);
        return;
      default:
        console.error(`Unexpected error encountered`);
        return;
    }
  }
  };
  
