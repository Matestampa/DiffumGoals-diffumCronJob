const { main_process } = require('../main_process');
const { send_2_queue } = require('../queue');
const { DB_PAGE_LIMIT, TODAY } = require('../const_vars');
const { get_Goals_by_page } = require('../db'); // Assuming this is where get_Goals_by_page is defined

jest.mock('../../shared/mongodb');
jest.mock('../queue');
jest.mock('../db');

describe('main_process', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should process goals and send them to the queue', async () => {
        const mockGoals = [{ id: 1 }, { id: 2 }];
        get_Goals_by_page.mockResolvedValueOnce(mockGoals).mockResolvedValueOnce([]);
        send_2_queue.mockResolvedValue();

        const result = await main_process();

        expect(get_Goals_by_page).toHaveBeenCalledWith(TODAY, undefined, DB_PAGE_LIMIT);
        expect(send_2_queue).toHaveBeenCalledTimes(mockGoals.length);
        expect(result).toEqual({ error: undefined, totalProccesedGoals: mockGoals.length });
    });

    it('should handle errors from mongoDB', async () => {
        const mockError = new Error('Test error');
        get_Goals_by_page.mockRejectedValue(mockError);

        const result = await main_process();

        expect(get_Goals_by_page).toHaveBeenCalled();
        expect(result).toEqual({ error: mockError, totalProccesedGoals: 0 });
    });

    it("should handle errors from send_2_queue", async () => {
        const mockGoals = [{ id: 1 }, { id: 2 }];
        get_Goals_by_page.mockResolvedValueOnce(mockGoals).mockResolvedValueOnce([]);
        const mockError = new Error('Test error');
        send_2_queue.mockRejectedValue(mockError);

        const result = await main_process();

        expect(get_Goals_by_page).toHaveBeenCalled();
        expect(send_2_queue).toHaveBeenCalledTimes(1);
        expect(result).toEqual({ error: mockError, totalProccesedGoals: 1 });
    });
    
    //Check if function returns the correct num of proccesed goals after an error.
    it('should handle errors from send_2_queue on the 5th goal', async () => {
        const mockGoals = Array.from({ length: 10 }, (_, i) => ({ id: i + 1 }));
        const mockError = new Error('Test error');
        
        get_Goals_by_page.mockResolvedValueOnce(mockGoals).mockResolvedValueOnce([]);
        
        send_2_queue.mockImplementation((goal) => {
            if (goal.id === 5) {
                return Promise.reject(mockError);
            }
            return Promise.resolve();
        });
        const result = await main_process();

        expect(get_Goals_by_page).toHaveBeenCalledWith(TODAY, undefined, DB_PAGE_LIMIT);
        expect(send_2_queue).toHaveBeenCalledTimes(5); // Only the first 5 calls should be made
        expect(result).toEqual({ error: mockError, totalProccesedGoals: 4 });
    });
});