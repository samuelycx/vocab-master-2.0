import { Controller, Post, Body, Get, Query } from '@nestjs/common';
import { ProgressService } from './progress.service';
import { UpdateProgressDto } from './dto/update-progress.dto';

@Controller('progress')
export class ProgressController {
    constructor(private readonly service: ProgressService) { }

    @Post('sync')
    async sync(@Body() body: UpdateProgressDto) {
        return this.service.syncProgress(body);
    }

    @Get('stats')
    async getStats(@Query('userId') userId: string) {
        return this.service.getUserStats(userId);
    }

    @Post('reset')
    async resetProgress(@Body('userId') userId: string) {
        return this.service.resetProgress(userId);
    }

    @Get('achievements')
    async getAchievements() {
        return this.service.getAllAchievements();
    }

    @Get('leaderboard')
    async getLeaderboard(@Query('limit') limit: string) {
        return this.service.getLeaderboard(parseInt(limit) || 10);
    }

    @Post('set-category')
    async setCategory(@Body() body: { userId: string, category: string }) {
        return this.service.updateTargetCategory(body.userId, body.category);
    }


}
