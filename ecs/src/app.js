const AWS = require('aws-sdk')
const s3 = new AWS.S3()
const documentClient = new AWS.DynamoDB.DocumentClient()
const crypto = require('crypto')

async function handleEvent() {
  const bucket = process.env.BUCKET_NAME
  const key = process.env.OBJECT_NAME
  const ddbTable = process.env.TABLE_NAME

  // EventBridge events don't support suffix filtering like the S3 events do
  if (!key.endsWith('.json')) {
    console.log(`Ignoring unsupported file: ${bucket}/${key}`)
    return
  }

  const s3Params = {
    Bucket: bucket,
    Key: key
  }
  const s3Response = await s3.getObject(s3Params).promise()
  const data = JSON.parse(s3Response.Body.toString('utf-8'))

  // Add each record found in the file to DynamoDB
  await Promise.all(data.map(async (item) => {
    item.id = crypto.randomBytes(16).toString("hex")
    item.processed_at = new Date().toISOString()
    item.source = bucket + '/' + key
    const ddbParams = {
      TableName: ddbTable,
      Item: item
    }
    await documentClient.put(ddbParams).promise()
  }))
}

handleEvent()
