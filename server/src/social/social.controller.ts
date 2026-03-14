import { Body, Controller, Get, Headers, Post, Query } from '@nestjs/common';
import { AuthService } from '../auth/auth.service';
import { SocialService } from './social.service';

@Controller('social')
export class SocialController {
    constructor(
        private readonly socialService: SocialService,
        private readonly authService: AuthService,
    ) { }

    @Post('follow')
    async follow(
        @Headers('authorization') authorization: string,
        @Body() data: { followingId: string },
    ) {
        const user = await this.authService.requireUserFromAuthorization(authorization);
        return this.socialService.followUser(user.id, data.followingId);
    }

    @Post('unfollow')
    async unfollow(
        @Headers('authorization') authorization: string,
        @Body() data: { followingId: string },
    ) {
        const user = await this.authService.requireUserFromAuthorization(authorization);
        return this.socialService.unfollowUser(user.id, data.followingId);
    }

    @Get('feed')
    async getFeed(@Headers('authorization') authorization: string) {
        const user = await this.authService.requireUserFromAuthorization(authorization);
        return this.socialService.getSocialFeed(user.id);
    }

    @Get('friends')
    async getFriends(@Headers('authorization') authorization: string) {
        const user = await this.authService.requireUserFromAuthorization(authorization);
        return this.socialService.getFriends(user.id);
    }

    @Get('search')
    async search(@Query('q') query: string) {
        return this.socialService.searchUsers(query);
    }

    @Get('leaderboard')
    async getLeaderboard() {
        return this.socialService.getLeaderboard();
    }
}
