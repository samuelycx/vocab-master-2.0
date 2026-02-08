
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log('Seeding System Config...');

    // Default: PK Arena is ENABLED
    await prisma.systemConfig.upsert({
        where: { key: 'pk_arena_enabled' },
        update: {},
        create: { key: 'pk_arena_enabled', value: 'true' }
    });

    const configs = await prisma.systemConfig.findMany();
    console.log('Current System Configs:', configs);
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
