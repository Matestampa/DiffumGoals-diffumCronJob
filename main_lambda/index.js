
const {InternalError}=require("../shared/error_handling");

const {connect_MongoDB,disconnect_MongoDB}=require("../shared/mongodb");

const {main_process}=require("./main_process.js");

exports.handler=async(event,context)=>{
    
    await connect_MongoDB();

    let {error,totalProccesedGoals}=await main_process();
    
    try{
      await disconnect_MongoDB();
    }
    catch(e){throw new MainLambdaError({message:"FAIL",totalProccesedGoals},error)}
    
    if (error){
        throw new MainLambdaError({message:"FAIL",totalProccesedGoals},error);
    }
    else{
      console.log({
        message:"SUCCESS",
        totalProccesedGoals:totalProccesedGoals
      })
      return;
    }
}

class MainLambdaError extends InternalError{
    constructor(message,attachedError){
        super(message,attachedError);
        this.name="MainLambdaError";
        this.message=message;
    }
}