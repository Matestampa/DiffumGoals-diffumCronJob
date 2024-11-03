
const { SQSClient,SendMessageCommand } = require("@aws-sdk/client-sqs");

const {AWS_SQS_VARS}=require("../config/aws_config.js");

const { aws_errorHandler } = require("./error_handler.js");

const sqsClient = new SQSClient({ region: AWS_SQS_VARS.region });

async function sendMessageToQueue(messageBody) {

  const params = {
    MessageBody: messageBody,
    QueueUrl: AWS_SQS_VARS.queueUrl,
    MessageGroupId: AWS_SQS_VARS.messageGroupId,
    
  };

  try {
    const data = await sqsClient.send(new SendMessageCommand(params));
  } 
  catch (err) {
    aws_errorHandler(err, "SQS");
  }

}

const SQS_FUNCS={sendMessageToQueue};

module.exports = { SQS_FUNCS };