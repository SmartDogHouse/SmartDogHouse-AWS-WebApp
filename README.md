# SmartDogHouse-AWS-WebApp

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
