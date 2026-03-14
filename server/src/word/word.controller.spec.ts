import { WordController } from './word.controller';
import { WordService } from './word.service';
import { ProgressService } from '../progress/progress.service';
import { AuthService } from '../auth/auth.service';

describe('WordController', () => {
    let controller: WordController;
    const authService = {
        requireUserFromAuthorization: jest.fn(),
    };
    const wordService = {
        getWordsForSession: jest.fn(),
    };
    const progressService = {
        getReviewSessionWords: jest.fn(),
        getMistakes: jest.fn(),
        getLearnedWords: jest.fn(),
    };

    beforeEach(() => {
        jest.clearAllMocks();
        controller = new WordController(
            wordService as unknown as WordService,
            progressService as unknown as ProgressService,
            authService as unknown as AuthService,
        );
    });

    it('uses authorized user id for review and mistakes', async () => {
        authService.requireUserFromAuthorization.mockResolvedValue({ id: 'user-1' });
        progressService.getReviewSessionWords.mockResolvedValue([]);
        progressService.getMistakes.mockResolvedValue([]);

        await controller.getReviewWords('Bearer token');
        await controller.getMistakeWords('Bearer token');

        expect(progressService.getReviewSessionWords).toHaveBeenCalledWith('user-1', 30);
        expect(progressService.getMistakes).toHaveBeenCalledWith('user-1');
    });

    it('uses authorized user id for learned words', async () => {
        authService.requireUserFromAuthorization.mockResolvedValue({ id: 'user-2' });
        progressService.getLearnedWords.mockResolvedValue({ data: [], total: 0, page: 1, lastPage: 1 });

        await controller.getLearnedWords('Bearer token', 1, 20, 'abandon');

        expect(progressService.getLearnedWords).toHaveBeenCalledWith('user-2', 1, 20, 'abandon');
    });
});
