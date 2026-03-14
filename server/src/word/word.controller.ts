import { Controller, Get, Query, ParseIntPipe, DefaultValuePipe, Headers } from '@nestjs/common';
import { WordService } from './word.service';
import { AuthService } from '../auth/auth.service';

import { ProgressService } from '../progress/progress.service';

@Controller(['word', 'words'])
export class WordController {
    constructor(
        private readonly wordService: WordService,
        private readonly progressService: ProgressService,
        private readonly authService: AuthService,
    ) { }

    @Get('session')
    async getSessionWords(
        @Query('count', new DefaultValuePipe(10), ParseIntPipe) count: number,
        @Query('category') category: string
    ) {
        const words = await this.wordService.getWordsForSession(count, category);
        return {
            success: true,
            data: {
                words,
                total: words.length,
            },
        };
    }

    @Get('review')
    async getReviewWords(
        @Headers('authorization') authorization: string
    ) {
        const user = await this.authService.requireUserFromAuthorization(authorization);
        // Get reviews from progress service
        const reviewRecords = await this.progressService.getReviewSessionWords(user.id, 30);
        // Map to Word objects (frontend expects words)
        return reviewRecords.map(r => ({
            ...r.word,
            _reviewData: {
                interval: r.interval,
                repetition: r.repetition,
                nextReview: r.nextReview
            }
        }));
    }

    @Get('mistakes')
    async getMistakeWords(
        @Headers('authorization') authorization: string
    ) {
        const user = await this.authService.requireUserFromAuthorization(authorization);
        const records = await this.progressService.getMistakes(user.id);
        return records.map(r => ({
            ...r.word,
            _mistakeCount: r.mistakeCount
        }));
    }
    @Get('learned')
    async getLearnedWords(
        @Headers('authorization') authorization: string,
        @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
        @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number,
        @Query('search') search: string
    ) {
        const user = await this.authService.requireUserFromAuthorization(authorization);
        return this.progressService.getLearnedWords(user.id, page, limit, search);
    }
}
