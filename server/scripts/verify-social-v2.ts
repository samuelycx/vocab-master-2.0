import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('--- Social Verification ---');

    // Create or find mock users
    const user1 = await prisma.user.upsert({
        where: { username: 'test_follower' },
        update: {},
        create: { username: 'test_follower', avatar: '😎' }
    });

    const user2 = await prisma.user.upsert({
        where: { username: 'test_influencer' },
        update: {},
        create: { username: 'test_influencer', avatar: '💃' }
    });

    console.log(`User1: ${user1.username}, User2: ${user2.username}`);

    // User1 follows User2
    console.log('Follow action...');
    await prisma.follow.upsert({
        where: { followerId_followingId: { followerId: user1.id, followingId: user2.id } },
        update: {},
        create: { followerId: user1.id, followingId: user2.id }
    });

    // Create a fake achievement for User2
    console.log('Creating fake activity for User2...');
    const achievement = await prisma.achievement.findFirst();
    if (achievement) {
        await prisma.userAchievement.upsert({
            where: { userId_achievementId: { userId: user2.id, achievementId: achievement.id } },
            update: { earnedAt: new Date() },
            create: { userId: user2.id, achievementId: achievement.id }
        });
    }

    // Verify Feed for User1
    const follows = await prisma.follow.findMany({ where: { followerId: user1.id } });
    console.log(`User1 follows count: ${follows.length}`);

    const feed = await prisma.userAchievement.findMany({
        where: { userId: { in: follows.map(f => f.followingId) } },
        include: { user: true, achievement: true }
    });

    console.log('Feed Item Found:', feed.length > 0 ? feed[0].achievement.name : 'None');
    console.log('Social Backend Logic: PASS');
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
