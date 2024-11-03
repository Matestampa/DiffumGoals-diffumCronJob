const { get_env } = require("./get_env.js");

get_env();


const AWS_S3_VARS={
    localEndpoint:process.env.S3_LOCAL_ENDPOINT,
    bucketRegion:process.env.S3_BUCKET_REGION,
    bucketName:process.env.S3_BUCKET_NAME
}

const AWS_SQS_VARS={
    queueUrl:process.env.SQS_QUEUE_URL,
    region:process.env.SQS_REGION,
    messageGroupId:process.env.SQS_MESSAGE_GROUP_ID
}


module.exports= {AWS_S3_VARS,AWS_SQS_VARS};