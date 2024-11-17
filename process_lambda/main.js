const {updateGoal}=require("./update/updateGoal.js");

const {internalError_handler,InternalError}=require("../shared/error_handling");

async function main(goals){
    
    //Modify goals imgs or something else
    
    let totalProcessedGoals=0;

    for (let i=0;i<goals.length;i++){
        let goal=goals[i]; //o parsear el JSON
        
        try{
            if (goal.action=="UPDATE"){
                await updateGoal(goal.id)
            }
            if (goal.action=="DELETE"){
                //await deleteGoal(goal.id)
            } 
        }
        catch(e){
            internalError_handler(new ProcessLambdaError(`Failed goal with id:${goal.id}`,e),
                                 goal.action);
            break;
        }
        totalProcessedGoals++;
    }
    return totalProcessedGoals;
}

class ProcessLambdaError extends InternalError{
    constructor(message,attachedError){
        super(message,attachedError);
        this.name="ProcessLambdaError";
        this.message=message;
    }
}

module.exports={main,ProcessLambdaError};