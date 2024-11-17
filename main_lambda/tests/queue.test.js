const { send_2_queue, clasify_goalAction } = require('../queue.js');
const { SQS_FUNCS } = require('../../shared/aws_services');
const { TODAY } = require('../const_vars.js');

jest.mock('../../shared/aws_services');

describe('queue.js tests', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('send_2_queue', () => {
        SQS_FUNCS.sendMessageToQueue.mockResolvedValueOnce();

        it('should send a DELETE message if limit_date is less than or equal to TODAY', async () => {
            const goal = {
                _id: '123',
                limit_date: TODAY
            };

            await send_2_queue(goal);

            expect(SQS_FUNCS.sendMessageToQueue).toHaveBeenCalledWith(JSON.stringify({
                id: goal._id,
                action: 'DELETE'
            }));
        });

        it('should send an UPDATE message if limit_date is greater than TODAY', async () => {
            const limit_date = new Date(TODAY);
            limit_date.setDate(limit_date.getDate() + 1);
            const goal = {
                _id: '123',
                limit_date: limit_date
            };

            await send_2_queue(goal);

            expect(SQS_FUNCS.sendMessageToQueue).toHaveBeenCalledWith(JSON.stringify({
                id: goal._id,
                action: 'UPDATE'
            }));
        });
    });
});