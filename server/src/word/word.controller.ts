import { Controller, Get, Query, ParseIntPipe, DefaultValuePipe } from '@nestjs/common';
import { WordService } from './word.service';

import { ProgressService } from '../progress/progress.service';

@Controller('word')
export class WordController {
    constructor(
        private readonly wordService: WordService,
        private readonly progressService: ProgressService
    ) { }

    @Get('session')
    async getSessionWords(
        @Query('count', new DefaultValuePipe(10), ParseIntPipe) count: number,
        @Query('category') category: string
    ) {
        return this.wordService.getWordsForSession(count, category);
    }

    @Get('review')
    async getReviewWords(
        @Query('userId') userId: string
    ) {
        if (!userId) return [];
        // Get reviews from progress service
        const reviewRecords = await this.progressService.getReviews(userId);
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
        @Query('userId') userId: string
    ) {
        if (!userId) return [];
        const records = await this.progressService.getMistakes(userId);
        return records.map(r => ({
            ...r.word,
            _mistakeCount: r.mistakeCount
        }));
    }
    @Get('learned')
    async getLearnedWords(
        @Query('userId') userId: string,
        @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
        @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number,
        @Query('search') search: string
    ) {
        if (!userId) return { data: [], total: 0, page: 1, lastPage: 1 };
        return this.progressService.getLearnedWords(userId, page, limit, search);
    }
}
