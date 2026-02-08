import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class SocialService {
    constructor(private prisma: PrismaService) { }

    async followUser(followerId: string, followingId: string) {
        if (followerId === followingId) {
            throw new BadRequestException('You cannot follow yourself');
        }

        try {
            await this.prisma.follow.create({
                data: {
                    followerId,
                    followingId,
                },
            });
            return { success: true };
        } catch (e) {
            return { success: true, message: 'Already following' };
        }
    }

    async unfollowUser(followerId: string, followingId: string) {
        try {
            await this.prisma.follow.delete({
                where: {
                    followerId_followingId: {
                        followerId,
                        followingId,
                    },
                },
            });
            return { success: true };
        } catch (e) {
            return { success: true, message: 'Not following anyway' };
        }
    }

    async getFriends(userId: string) {
        const following = await this.prisma.follow.findMany({
            where: { followerId: userId },
            include: { following: { select: { id: true, username: true, avatar: true, level: true, xp: true } } }
        });

        const followers = await this.prisma.follow.findMany({
            where: { followingId: userId },
            include: { follower: { select: { id: true, username: true, avatar: true, level: true, xp: true } } }
        });

        return {
            following: following.map(f => f.following),
            followers: followers.map(f => f.follower)
        };
    }

    async searchUsers(query: string) {
        if (!query) return [];
        return this.prisma.user.findMany({
            where: { username: { contains: query } },
            select: { id: true, username: true, avatar: true, level: true },
            take: 10
        });
    }

    async getLeaderboard() {
        return this.prisma.user.findMany({
            orderBy: { xp: 'desc' },
            take: 20,
            select: { id: true, username: true, avatar: true, level: true, xp: true, streak: true }
        });
    }

    async getSocialFeed(userId: string) {
        const following = await this.prisma.follow.findMany({
            where: { followerId: userId },
            select: { followingId: true }
        });

        const followingIds = following.map(f => f.followingId);

        if (followingIds.length === 0) return [];

        // Fetch recent achievements and match results from following
        const achievementsPromise = this.prisma.userAchievement.findMany({
            where: { userId: { in: followingIds } },
            orderBy: { earnedAt: 'desc' },
            take: 10,
            include: {
                user: { select: { username: true, avatar: true } },
                achievement: true
            }
        });

        const matchesPromise = this.prisma.matchParticipant.findMany({
            where: { userId: { in: followingIds }, result: 'WIN' },
            orderBy: { match: { createdAt: 'desc' } },
            take: 10,
            include: {
                user: { select: { username: true, avatar: true } },
                match: true
            }
        });

        const [achievements, wins] = await Promise.all([achievementsPromise, matchesPromise]);

        // Combine and sort
        const feed = [
            ...achievements.map(a => ({
                id: `ach_${a.id}`,
                type: 'ACHIEVEMENT',
                userId: a.userId,
                username: a.user.username,
                avatar: a.user.avatar,
                title: a.achievement.name,
                description: a.achievement.description,
                icon: a.achievement.icon,
                timestamp: a.earnedAt
            })),
            ...wins.map(w => ({
                id: `win_${w.id}`,
                type: 'WIN',
                userId: w.userId!,
                username: w.user?.username || 'Unknown',
                avatar: w.user?.avatar || '👤',
                title: '获得了 PK 胜利',
                description: `在 PK 竞技场中得到了 ${w.score} 分`,
                icon: '⚔️',
                timestamp: w.match.createdAt
            }))
        ];

        return feed.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime()).slice(0, 20);
    }

    async getFollows(userId: string) {
        const following = await this.prisma.follow.findMany({
            where: { followerId: userId },
            include: { following: { select: { id: true, username: true, avatar: true, level: true } } }
        });

        const followers = await this.prisma.follow.findMany({
            where: { followingId: userId },
            include: { follower: { select: { id: true, username: true, avatar: true, level: true } } }
        });

        return {
            following: following.map(f => f.following),
            followers: followers.map(f => f.follower)
        };
    }
}
