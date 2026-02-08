import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function verifyCategories() {
    console.log('--- Verifying Vocab Categories ---');

    // 1. Check if words are correctly categorized in DB
    const categories = ['GENERAL', 'TOEFL', 'GRE', 'BUSINESS'];
    for (const cat of categories) {
        const count = await prisma.word.count({ where: { category: cat } });
        console.log(`Category ${cat}: ${count} words found.`);
        if (count === 0 && cat !== 'GENERAL') {
            console.error(`Error: No words found for category ${cat}`);
        }
    }

    // 2. Test Word fetching with filter
    const toeflWords = await prisma.$queryRaw`SELECT * FROM Word WHERE category = 'TOEFL' LIMIT 5`;
    console.log('TOEFL Words Sample:', toeflWords);

    // 3. Check User targetCategory default
    const user = await prisma.user.findFirst();
    if (user) {
        console.log(`User ${user.username} current category: ${user.targetCategory}`);

        // Test update
        const updated = await prisma.user.update({
            where: { id: user.id },
            data: { targetCategory: 'TOEFL' }
        });
        console.log(`User ${user.username} updated category: ${updated.targetCategory}`);

        // Revert
        await prisma.user.update({
            where: { id: user.id },
            data: { targetCategory: 'GENERAL' }
        });
    }

    console.log('--- Verification Finished ---');
}

verifyCategories()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
