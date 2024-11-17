const { main } = require('../main.js');
const { updateGoal } = require('../update/updateGoal.js');
const { internalError_handler, InternalError } = require('../../shared/error_handling');

jest.mock('../update/updateGoal.js');
jest.mock('../../shared/error_handling');

//AT THE MOMENT IT ONLY WORKS FOR UPDATE CASES
describe('main function', () => {
    
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should process all goals and return the total processed goals', async () => {
        const goals = [
            { id: 1, action: 'UPDATE' },
            { id: 2, action: 'DELETE' },
            { id: 3, action: 'UPDATE' }
        ];

        updateGoal.mockResolvedValue();

        const totalProcessedGoals = await main(goals);

        expect(totalProcessedGoals).toBe(3);
        expect(updateGoal).toHaveBeenCalledTimes(2);
    });

    it('should handle errors and stop processing further goals', async () => {
        const goals = [
            { id: 1, action: 'UPDATE' },
            { id: 2, action: 'DELETE' },
            { id: 3, action: 'UPDATE' }
        ];

        const mockError = new Error('Test error');
        updateGoal.mockRejectedValueOnce(mockError);

        const totalProcessedGoals = await main(goals);

        expect(totalProcessedGoals).toBe(0);
        expect(internalError_handler).toHaveBeenCalledWith(expect.any(InternalError), 'UPDATE');
        expect(updateGoal).toHaveBeenCalledTimes(1);
    });

    it('should handle errors and stop processing further goals on the 3rd goal', async () => {
        const goals = [
            { id: 1, action: 'UPDATE' },
            { id: 2, action: 'UPDATE' },
            { id: 3, action: 'UPDATE' },
            { id: 4, action: 'UPDATE' }
        ];
        
        const mockError = new Error('Test error');
        updateGoal
            .mockResolvedValueOnce()
            .mockResolvedValueOnce()
            .mockRejectedValueOnce(mockError);

        const totalProcessedGoals = await main(goals);

        expect(totalProcessedGoals).toBe(2);
        expect(internalError_handler).toHaveBeenCalledWith(expect.any(InternalError), 'UPDATE');
        expect(updateGoal).toHaveBeenCalledTimes(3);
    });
});