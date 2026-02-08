import { Controller, Post, Get, Body, Query, Param } from '@nestjs/common';
import { SocialService } from './social.service';

@Controller('social')
export class SocialController {
    constructor(private readonly socialService: SocialService) { }

    @Post('follow')
    async follow(@Body() data: { followerId: string, followingId: string }) {
        return this.socialService.followUser(data.followerId, data.followingId);
    }

    @Post('unfollow')
    async unfollow(@Body() data: { followerId: string, followingId: string }) {
        return this.socialService.unfollowUser(data.followerId, data.followingId);
    }

    @Get('feed/:userId')
    async getFeed(@Param('userId') userId: string) {
        return this.socialService.getSocialFeed(userId);
    }

    @Get('friends/:userId')
    async getFriends(@Param('userId') userId: string) {
        return this.socialService.getFriends(userId);
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
