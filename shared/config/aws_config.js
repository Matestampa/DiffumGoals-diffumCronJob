const { get_env } = require("./get_env.js");

get_env();


const AWS_S3_VARS={
    localEndpoint:process.env.S3_LOCAL_ENDPOINT,
    bucketRegion:process.env.S3_BUCKET_REGION,
    bucketName:process.env.S3_BUCKET_NAME,
    credentials:{
        accessKeyId:process.env.S3_AWS_ACCESS_KEY_ID,
        secretAccessKey:process.env.S3_AWS_SECRET_ACCESS_KEY
    }
}

const AWS_SQS_VARS={
    queueUrl:process.env.SQS_QUEUE_URL,
    region:process.env.SQS_REGION,
    messageGroupId:process.env.SQS_MESSAGE_GROUP_ID
}


module.exports= {AWS_S3_VARS,AWS_SQS_VARS};