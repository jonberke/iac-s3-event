import * as cdk from '@aws-cdk/core'
import * as lambda from '@aws-cdk/aws-lambda'
import * as s3 from "@aws-cdk/aws-s3"
import * as dynamodb from '@aws-cdk/aws-dynamodb'
import { S3EventSource } from '@aws-cdk/aws-lambda-event-sources'

export class IacLambdaStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props)

    const table = new dynamodb.Table(this, 'table', {
      partitionKey: {
        name: 'id',
        type: dynamodb.AttributeType.STRING
      },
      readCapacity: 1,
      writeCapacity: 10
    })

    const bucket = new s3.Bucket(this, 'bucket')

    const handler = new lambda.Function(this, 'handler', {
      code: lambda.Code.fromAsset('src/'),
      handler: 'index.handler',
      runtime: lambda.Runtime.NODEJS_12_X,
      environment: {
        DDB_TABLE: table.tableName
      },
      events: [new S3EventSource(bucket, {
        events: [s3.EventType.OBJECT_CREATED],
        filters: [{
          suffix: '.json'
        }]
      })]
    })
    bucket.grantRead(handler)
    table.grantWriteData(handler)
  }
}
