
const {connect_MongoDB,disconnect_MongoDB}=require("../shared/mongodb");

const {S3}=require("../shared/aws_services");

const {add_2_batchItemFailures}=require("./utils.js");

const {internalError_handler,InternalError}=require("../shared/error_handling");

const {main,ProcessLambdaError}=require("./main.js");

exports.handler=handlerFunc;

async function handlerFunc(event,context){

    let batchItemFailures = [];
    let goalsBodies=event.Records.map(record => JSON.parse(record.body));
    
    //CONNECT TO MONGODB
    try{
        await connect_MongoDB();
    }
    catch(e){
        
        //INTERNAL ERROR HANDLER
        internalError_handler(new ProcessLambdaError("Failed to connect to MongoDB",e));
        
        //ADD ALL ITEMS TO BATCHITEMFAILURES
        batchItemFailures=add_2_batchItemFailures(event.Records,0)
        //console.log(batchItemFailures);
        return {batchItemFailures}
    }
    
    //CALL MAIN FUNCTION
    let totalProcessedGoals=await main(goalsBodies);
    
    //CHECK IF ALL GOALS WERE PROCESSED, else add the remaining to batchItemFailures
    if (totalProcessedGoals!=event.Records.length){
        batchItemFailures=add_2_batchItemFailures(event.Records,totalProcessedGoals);
    }

    
    try{
        //DISCONNECT FROM MONGODB
        await disconnect_MongoDB();

        //CLOSE S3 CONNECTION
        S3.destroy();
    }
    catch(e){
        //INTERNAL ERROR HANDLER. Not necessary to add to batchItemFailures as the lambda has already executed
        internalError_handler(new ProcessLambdaError("Failed to disconnect from MongoDB or S3",e));
    }
    return {batchItemFailures}

}


module.exports={handlerFunc}