import * as cdk from '@aws-cdk/core'
import * as ecs from '@aws-cdk/aws-ecs'
import * as ec2 from '@aws-cdk/aws-ec2'
import * as dynamodb from '@aws-cdk/aws-dynamodb'
import * as s3 from "@aws-cdk/aws-s3"
import { EventField } from '@aws-cdk/aws-events'
import { EcsTask } from '@aws-cdk/aws-events-targets'
import { Trail } from '@aws-cdk/aws-cloudtrail'

export class IacEcsStack extends cdk.Stack {
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
    new Trail(this, 'trail').addS3EventSelector([{
      bucket
    }])

    const cluster = new ecs.Cluster(this, 'cluster', {
      vpc: new ec2.Vpc(this, 'vpc', {
        maxAzs: 1
      })
    })

    const taskDefinition = new ecs.FargateTaskDefinition(this, 'task-definition')
    const container = taskDefinition.addContainer('container', {
      image: ecs.ContainerImage.fromAsset('src/'),
      environment: {
        TABLE_NAME: table.tableName
      },
      logging: new ecs.AwsLogDriver({
        streamPrefix: 'processS3'
      })
    })
    bucket.grantRead(taskDefinition.taskRole)
    table.grantWriteData(taskDefinition.taskRole)

    Trail.onEvent(this, 's3-rule', {
      eventPattern: {
        source: ['aws.s3'],
        detail: {
          eventName: ['PutObject', 'CompleteMultipartUpload']
        }
      },
      target: new EcsTask({
        cluster,
        taskDefinition,
        containerOverrides: [{
          containerName: container.containerName,
          environment: [
            {
              name: 'BUCKET_NAME',
              value: EventField.fromPath('$.detail.requestParameters.bucketName')
            }, {
              name: 'OBJECT_NAME',
              value: EventField.fromPath('$.detail.requestParameters.key')
            }
          ]
        }]
      })
    })
  }
}
