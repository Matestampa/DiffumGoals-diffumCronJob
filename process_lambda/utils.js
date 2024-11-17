

function add_2_batchItemFailures(eventRecords,from){
    let batchItemFailures = [];
    for (let i=from;i<eventRecordsRecords.length;i++){
        batchItemFailures.push({itemIdentifier:eventRecords[i].messageId});
    }
    return batchItemFailures;
}

module.exports = {add_2_batchItemFailures}