const {handlerFunc} = require('../index.js');
const {main,ProcessLambdaError}=require("../main.js");
const { connect_MongoDB, disconnect_MongoDB } = require('../../shared/mongodb');
const { S3 } = require('../../shared/aws_services');
const { add_2_batchItemFailures } = require('../utils.js');
const { internalError_handler, InternalError } = require('../../shared/error_handling');

jest.mock('../../shared/mongodb');
jest.mock('../../shared/aws_services');
jest.mock('../utils.js');
jest.mock('../../shared/error_handling');

jest.mock("../main.js");

/*jest.mock('../index.js', () =>{
    const actualModule=jest.requireActual('../index.js')
    return {
        ...actualModule,
        main:jest.fn()
    }
});*/

const mimic_add_2_batchItemFailures = (event, startIndex = 0) => 
    event.Records.slice(startIndex).map(({ messageId }) => ({ itemIdentifier: messageId }));

describe('handler function', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    let batchItemFailures;

    it('should handle MongoDB connection error and return batchItemFailures', async () => {
        const eventRecords ={Records:[
            {
            messageId: '123',
            body: JSON.stringify({ id: 1, action: 'UPDATE' })
            },
            {
            messageId: '456',
            body: JSON.stringify({ id: 2, action: 'DELETE' })
            }

        ]};

        batchItemFailures = mimic_add_2_batchItemFailures(eventRecords,0);
        //console.log(batchItemFailures)

        const mockError = new Error('MongoDB connection error');
        connect_MongoDB.mockRejectedValue(mockError);
        add_2_batchItemFailures.mockReturnValue(batchItemFailures);

        const result = await handlerFunc(eventRecords);
        //console.log(result);

        expect(connect_MongoDB).toHaveBeenCalledTimes(1);
        expect(internalError_handler).toHaveBeenCalledWith(expect.any(ProcessLambdaError));
        expect(add_2_batchItemFailures).toHaveBeenCalledWith(eventRecords["Records"], 0);
        expect(result).toEqual({batchItemFailures: batchItemFailures});
    });

    it('should process all goals successfully and return empty batchItemFailures', async () => {
        const eventRecords ={Records:[
            {
            messageId: '123',
            body: JSON.stringify({ id: 1, action: 'UPDATE' })
            },
            {
            messageId: '456',
            body: JSON.stringify({ id: 2, action: 'DELETE' })
            },
            {
            messageId: '789',
            body: JSON.stringify({ id: 3, action: 'UPDATE' })
            }

        ]};

        batchItemFailures=mimic_add_2_batchItemFailures(eventRecords,3);

        main.mockResolvedValue(3);

        const result = await handlerFunc(eventRecords);

        expect(connect_MongoDB).toHaveBeenCalledTimes(1);
        //expect(main).toHaveBeenCalledWith(event.Records);
        expect(disconnect_MongoDB).toHaveBeenCalledTimes(1);
        expect(S3.destroy).toHaveBeenCalledTimes(1);
        expect(result).toEqual({ batchItemFailures: [] });
    });
    
    it('should process all goals and return batchItemFailures if not all goals are processed', async () => {
        const eventRecords ={Records: [
            {
            messageId: '123',
            body: JSON.stringify({ id: 1, action: 'UPDATE' })
            },
            {
            messageId: '456',
            body: JSON.stringify({ id: 2, action: 'DELETE' })
            },
            {
            messageId: '789',
            body: JSON.stringify({ id: 3, action: 'UPDATE' })
            }

        ]};
        
        const failedGoal=2;

        batchItemFailures=mimic_add_2_batchItemFailures(eventRecords,failedGoal);

        main.mockResolvedValueOnce(failedGoal);
        add_2_batchItemFailures.mockReturnValue(batchItemFailures);

        const result = await handlerFunc(eventRecords);

        expect(connect_MongoDB).toHaveBeenCalledTimes(1);
        //expect(main).toHaveBeenCalledWith(event.Records);
        expect(add_2_batchItemFailures).toHaveBeenCalledWith(eventRecords["Records"],2);
        expect(disconnect_MongoDB).toHaveBeenCalledTimes(1);
        expect(S3.destroy).toHaveBeenCalledTimes(1);
        expect(result).toEqual({ batchItemFailures: batchItemFailures });
    });

});