const {SQS_FUNCS}=require("../shared/aws_services");

const {TODAY}=require("./const_vars.js");

async function send_2_queue(goal){
    
    //clasificar update o delete
    let action=clasify_goalAction(goal.limit_date);
    
    let message={
        id:goal._id,
        action:action,
    }
    //mandar a queue
    await SQS_FUNCS.sendMessageToQueue(JSON.stringify(message));
}

function clasify_goalAction(limit_date){
   
    if (limit_date<=TODAY){
        return "DELETE";
    }
    else{
        return "UPDATE";
    }
}

module.exports={send_2_queue}