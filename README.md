# SmartDogHouse-AWS-WebApp
[![Quality Gate Status](https://sonarcloud.io/api/project_badges/measure?project=SmartDogHouse_SmartDogHouse-AWS-WebApp&metric=alert_status)](https://sonarcloud.io/dashboard?id=SmartDogHouse_SmartDogHouse-AWS-WebApp)
[![CodeFactor](https://www.codefactor.io/repository/github/smartdoghouse/smartdoghouse-aws-webapp/badge)](https://www.codefactor.io/repository/github/smartdoghouse/smartdoghouse-aws-webapp)
[![Codacy Badge](https://app.codacy.com/project/badge/Grade/2cde09679aab4aefb0de88b14d515063)](https://www.codacy.com/gh/SmartDogHouse/SmartDogHouse-AWS-WebApp/dashboard?utm_source=github.com&amp;utm_medium=referral&amp;utm_content=SmartDogHouse/SmartDogHouse-AWS-WebApp&amp;utm_campaign=Badge_Grade)

This is the back-end of the WebApp, hosted on **AWS**. 

It is composed by **serverless functions** (lambda) exposed using different method 
like: **Rest API, IoT Core Rule, CloudWatch Event and Websocket**.

The WebApp back-end is based on **nodeJS**.

Most of the back-end **pipeline** is deployed using **SAM** ( Serverless Application Model ), using the appropriate 
**Template.yaml**

The only two things that remain deployed manually are:
- The main DB
- The IoT Core thing and relative cretificate/permissin policy

However with some work it is possible to shorten the gap even more. 


It is possible to run some of the serverless functions using **SAM**.

## Tools needed
- **SAM**
- **AWS CLI**
- **NodeJS**

**SAM** need **AWS CLI** to work properly.
It is necessary to configure aws cli using **aws configure**, 

the aws cli provide to SAM the identifier and the key used to autenticate.

Now install all nodeJS dependencies using **npm install** inside the folder:
- lambda 
- lambda/websock


Now we can execute locally the aws **lambda** instance, or invoke directly one function with:
- invoke single: **sam local invoke FUNCTION_ID**
- execute lambda instance: **sam local start-api**

## Tests
To execute test it is sufficent to use: **npm test**

## Attention to local CORS error

While the AWS remote server provides a CORS proxy for api calls, the SAM instance does not do it.
This will cause some problem with REST API calls.

A workaround is to host the proper local CORS proxy.

More detail can be found at: https://github.com/aws/aws-sam-cli/issues/323#issuecomment-483650280



## License

This project is under a License - see the [LICENSE](LICENSE) file for details
