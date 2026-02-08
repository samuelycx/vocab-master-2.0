
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const words = await prisma.word.findMany({ take: 20 });
    console.log(JSON.stringify(words, null, 2));
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
