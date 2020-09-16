const AWS = require('aws-sdk')
const s3 = new AWS.S3()
const documentClient = new AWS.DynamoDB.DocumentClient()
const crypto = require('crypto')

exports.handler = async (event) => {
  // Process each file listed in the event
  await Promise.all(event.Records.map(async (record) => {
    const s3Params = {
      Bucket: record.s3.bucket.name,
      Key: record.s3.object.key
    }
    const s3Response = await s3.getObject(s3Params).promise()
    const data = JSON.parse(s3Response.Body)

    // Add each record found in the file to DynamoDB
    await Promise.all(data.map(async (item) => {
      item.id = crypto.randomBytes(16).toString("hex")
      item.processed_at = new Date().toISOString()
      item.source = record.s3.bucket.name + '/' + record.s3.object.key
      const ddbParams = {
        TableName: process.env.DDB_TABLE,
        Item: item
      }
      await documentClient.put(ddbParams).promise()
    }))
  }))
}
