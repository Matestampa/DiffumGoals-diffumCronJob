const {GoalModel,MongoDB_Error}=require("../shared/mongodb");

//Returns goals by page and limit
//filters by "createdAt" < currentDate
//selects "limit_date"
//sorts by limit_date asc
async function get_Goals_by_page(currentDate,page,limit){
    try{
        return await GoalModel.find({createdAt:{$lt:currentDate}}).
                     select("limit_date").
                     sort({limit_date:1}).
                     skip((page-1)*limit).
                     limit(limit).lean();
    }
    catch(e){
        throw new MongoDB_Error("",e)
    }
}

module.exports={get_Goals_by_page};