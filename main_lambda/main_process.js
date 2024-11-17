const {connect_MongoDB,disconnect_MongoDB}=require("../shared/mongodb");

const {DB_PAGE_LIMIT,TODAY}=require("./const_vars.js");

const {get_Goals_by_page}=require("./db.js");
const {send_2_queue}=require("./queue.js");

async function main_process(){
    
    let totalProccesedGoals=0;

    //ir trayendo data db
    let goals;
    let page;
    let today=TODAY;

    //bucle do while
    try{
      do{
        //get from db
        goals=await get_Goals_by_page(today,page,DB_PAGE_LIMIT);
        console.log(goals);
  
        //send to sqs
        for (let goal of goals){
          await send_2_queue(goal);
          totalProccesedGoals++;
        }
        
        page++;
    
      }
      while(goals.length>=DB_PAGE_LIMIT); 
    }
    catch(e){
      return {error:e,totalProccesedGoals}
    }
    return {error:undefined,totalProccesedGoals};
}

module.exports={main_process};