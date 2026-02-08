import { PrismaClient } from '@prisma/client';
import { io } from 'socket.io-client';

const prisma = new PrismaClient();

async function verifyBan() {
    const API_URL = 'http://localhost:3000/api';
    const TEST_USER = 'BanTestUser_' + Date.now();

    // 1. Create User
    console.log(`Creating user ${TEST_USER}...`);
    const createRes = await fetch(`${API_URL}/auth/create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: TEST_USER })
    });
    const createData = await createRes.json();
    if (!createData.success) throw new Error('Failed to create user');
    const userId = createData.user.id;
    console.log(`User created: ${userId}`);

    // 2. Ban User
    console.log('Banning user...');
    const banRes = await fetch(`${API_URL}/admin/user/${userId}/ban`, { method: 'POST' });
    const banData = await banRes.json();
    console.log('Ban response:', banData);

    // Verify DB state
    const bannedUser = await prisma.user.findUnique({ where: { id: userId } });
    if (bannedUser?.role !== 'BANNED') throw new Error('User role request failed to update to BANNED');

    // 3. Try Login (Should Fail)
    console.log('Attempting login as banned user...');
    const loginRes = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: TEST_USER })
    });
    const loginData = await loginRes.json();
    if (loginData.success) throw new Error('❌ Login SUCCEEDED but should have FAILED!');
    console.log('✅ Login failed as expected:', loginData.message);

    // 4. Unban User
    console.log('Unbanning user...');
    await fetch(`${API_URL}/admin/user/${userId}/ban`, { method: 'POST' });

    const unbannedUser = await prisma.user.findUnique({ where: { id: userId } });
    if (unbannedUser?.role === 'BANNED') throw new Error('User role failed to revert from BANNED');

    // 5. Try Login (Should Succeed)
    console.log('Attempting login as unbanned user...');
    const loginRes2 = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: TEST_USER })
    });
    const loginData2 = await loginRes2.json();
    if (!loginData2.success) throw new Error('❌ Login FAILED but should have SUCCEEDED!');
    console.log('✅ Login succeeded!');

    console.log('✅ Ban/Unban verification passed!');
}

verifyBan()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
