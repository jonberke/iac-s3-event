# About
This repo contains the source code referred to in the [Simple infrastructure as
code blog post](https://out-with-the-old.theberkes.com/posts/infrastructure-as-code/).

Each directory takes a different approach at solving the problem:

* __ecs__: Uses the AWS CDK to build a solution using ECS and Fargate
* __lambda__: Uses the AWS CDK to build a solution using Lambda
* __sam__: Uses AWS SAM to build a solution using Lambda

# Prerequisite
This project requires the following tools to be installed:

* [AWS CDK](https://docs.aws.amazon.com/cdk/latest/guide/getting_started.html#getting_started_prerequisites)
* [TypeScript](https://www.typescriptlang.org/#installation)
* [Docker](https://docs.docker.com/get-docker/)
* [AWS SAM](https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/serverless-sam-cli-install.html)
  (Only required if deploying the SAM version)

# Deployment
Each subdirectory (ecs, lambda, sam) has its own self-contained deployment setup. Therefore, to
deploy an infrastructure, change to that infrastructure's subdirectory before running the commands
below.

Additionally, you'll need to run `npm install` in each subdirectory before you can deploy its infrastructure.

## ECS and Lambda

* `npm run build`
* `cdk deploy`

## SAM

* `sam build`
* `sam deploy --guided`

# Usage
The easiest way to test a deployment is with the AWS console.

1. Upload `sample-data.json` to the deployment's S3 bucket. The CDK bucket names are auto-generated
   and have the following form:
    * __ECS__: `iac-ecs-bucket*`
    * __Lambda__: `iac-lambda-bucket*`
1. Check the deployment's DynamoDB table for the contents of the uploaded data

You should see data in DynamoDB almost immediately for Lambda-based infrastructures. In my tests,
the ECS deployment took about a minute because of the container launch time.

# Cleanup

## ECS and Lambda

1. Delete the stack from the AWS console or run `cdk destroy`
1. Empty and delete the deployment's S3 buckets
    * __ECS__: `iac-ecs-bucket*` and `iac-ecs-trails*`
    * __Lambda__: `iac-lambda-bucket*`

## SAM

1. Empty the deployment's S3 bucket
1. Delete the stack from the AWS console or run `aws cloudformation delete-stack --stack-name iac-sam`
