import { Body, Controller, Get, Headers, Post, Query } from '@nestjs/common';
import { AuthService } from '../auth/auth.service';
import { ProgressService } from './progress.service';
import { UpdateProgressDto } from './dto/update-progress.dto';

@Controller('progress')
export class ProgressController {
    constructor(
        private readonly service: ProgressService,
        private readonly authService: AuthService,
    ) { }

    @Post('sync')
    async sync(
        @Headers('authorization') authorization: string,
        @Body() body: UpdateProgressDto,
    ) {
        const user = await this.authService.requireUserFromAuthorization(authorization);
        return this.service.syncProgress({
            ...body,
            userId: user.id,
        });
    }

    @Get('stats')
    async getStats(@Headers('authorization') authorization: string) {
        const user = await this.authService.requireUserFromAuthorization(authorization);
        const stats = await this.service.getUserStats(user.id);
        return {
            success: true,
            data: stats,
        };
    }

    @Get('reviews')
    async getReviews(@Headers('authorization') authorization: string) {
        const user = await this.authService.requireUserFromAuthorization(authorization);
        const total = await this.service.getReviewPoolCount(user.id);
        return {
            success: true,
            data: { total },
        };
    }

    @Post('reset')
    async resetProgress(@Headers('authorization') authorization: string) {
        const user = await this.authService.requireUserFromAuthorization(authorization);
        return this.service.resetProgress(user.id);
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
    async setCategory(
        @Headers('authorization') authorization: string,
        @Body() body: { category: string },
    ) {
        const user = await this.authService.requireUserFromAuthorization(authorization);
        return this.service.updateTargetCategory(user.id, body.category);
    }


}
