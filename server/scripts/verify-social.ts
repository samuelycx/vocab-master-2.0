import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function verifySocial() {
    const API_URL = 'http://localhost:3000/api';
    const USER1_NAME = 'SocialUser1_' + Date.now();
    const USER2_NAME = 'SocialUser2_' + Date.now();

    // 1. Create Users
    console.log(`Creating users ${USER1_NAME} and ${USER2_NAME}...`);
    const u1Res = await fetch(`${API_URL}/auth/create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: USER1_NAME })
    });
    const u1 = (await u1Res.json()).user;

    const u2Res = await fetch(`${API_URL}/auth/create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: USER2_NAME })
    });
    const u2 = (await u2Res.json()).user;

    console.log(`Users created: ${u1.id}, ${u2.id}`);

    // 2. Follow User
    console.log(`${USER1_NAME} following ${USER2_NAME}...`);
    const followRes = await fetch(`${API_URL}/social/follow`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ followerId: u1.id, followingId: u2.id })
    });
    const followData = await followRes.json();
    if (!followData.success) throw new Error('Follow failed');

    // 3. Verify Friends List for User 1
    console.log(`Checking friends for ${USER1_NAME}...`);
    const friendsRes = await fetch(`${API_URL}/social/friends/${u1.id}`);
    const friends = await friendsRes.json();
    if (!friends.following.some((f: any) => f.id === u2.id)) throw new Error('User 2 not in User 1 following list');
    console.log('✅ Follow list verified');

    // 4. Search User
    console.log(`Searching for ${USER2_NAME}...`);
    const searchRes = await fetch(`${API_URL}/social/search?q=${USER2_NAME}`);
    const searchResults = await searchRes.json();
    if (!searchResults.some((u: any) => u.id === u2.id)) throw new Error('Search failed to find user 2');
    console.log('✅ Search verified');

    // 5. Leaderboard
    console.log('Checking leaderboard...');
    const lbRes = await fetch(`${API_URL}/social/leaderboard`);
    const lb = await lbRes.json();
    if (lb.length === 0) throw new Error('Leaderboard is empty');
    console.log('✅ Leaderboard verified');

    // 6. Unfollow
    console.log(`${USER1_NAME} unfollowing ${USER2_NAME}...`);
    const unfollowRes = await fetch(`${API_URL}/social/unfollow`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ followerId: u1.id, followingId: u2.id })
    });
    const unfollowData = await unfollowRes.json();
    if (!unfollowData.success) throw new Error('Unfollow failed');

    // 7. Verify unfollow
    const friendsRes2 = await fetch(`${API_URL}/social/friends/${u1.id}`);
    const friends2 = await friendsRes2.json();
    if (friends2.following.some((f: any) => f.id === u2.id)) throw new Error('User 2 still in User 1 following list after unfollow');
    console.log('✅ Unfollow verified');

    console.log('✅ All Social System verifications passed!');
}

verifySocial()
    .catch((e: any) => {
        console.error('❌ Verification failed:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
