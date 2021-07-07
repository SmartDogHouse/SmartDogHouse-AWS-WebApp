const AWS = require('aws-sdk');

class Rectangle {
  AWS = require('aws-sdk');
  statusCode = 200
  // Create the DynamoDB Client with the region you want
  const region = 'eu-west-2';
  const dynamoDbClient = createDynamoDbClient(region);
  
  constructor(height, width) {
    this.height = height;
    this.width = width;
  }
}