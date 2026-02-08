import { PrismaClient } from '@prisma/client';
// No Service needed for simple seed, direct prisma access is fine for dev script
// But if we want to share logic, we could use services.
// For a seed script, keeping it simple with PrismaClient is usually better to avoid NestJS context overhead.

const prisma = new PrismaClient();

async function main() {
    console.log('Seeding reviews and mistakes...');

    // 1. Get or Create User
    // Assuming a default user exists or we pick the first one
    const user = await prisma.user.findFirst();

    if (!user) {
        console.error('No user found! Please run the app and login once to create a user.');
        return;
    }

    console.log(`Seeding for user: ${user.username} (${user.id})`);

    // 2. Get some words
    const words = await prisma.word.findMany({ take: 10 });
    if (words.length === 0) {
        console.error('No words found in DB!');
        return;
    }

    // 3. Create Overdue Reviews (First 5 words)
    const overdueWords = words.slice(0, 5);
    for (const word of overdueWords) {
        const pastDate = new Date();
        pastDate.setDate(pastDate.getDate() - 1); // 1 day ago

        await prisma.studyRecord.upsert({
            where: {
                userId_wordId: {
                    userId: user.id,
                    wordId: word.id
                }
            },
            update: {
                status: 'LEARNING',
                nextReview: pastDate,
                interval: 1,
                repetition: 1,
                easeFactor: 2.5
            },
            create: {
                userId: user.id,
                wordId: word.id,
                status: 'LEARNING',
                nextReview: pastDate,
                interval: 1,
                repetition: 1,
                easeFactor: 2.5
            }
        });
    }
    console.log(`Created ${overdueWords.length} overdue reviews.`);

    // 4. Create Mistakes (Next 5 words)
    const mistakeWords = words.slice(5, 10);
    for (const word of mistakeWords) {
        await prisma.studyRecord.upsert({
            where: {
                userId_wordId: {
                    userId: user.id,
                    wordId: word.id
                }
            },
            update: {
                mistakeCount: 5, // High mistake count
                status: 'LEARNING'
            },
            create: {
                userId: user.id,
                wordId: word.id,
                mistakeCount: 5,
                status: 'LEARNING'
            }
        });
    }
    console.log(`Created ${mistakeWords.length} mistake records.`);
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
