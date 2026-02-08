
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const count = await prisma.word.count();
    console.log(`Total words in DB: ${count}`);

    if (count === 0) {
        console.log('Seeding initial words...');
        const initialWords = [
            { text: 'ephemeral', partOfSpeech: 'adj.', meanings: JSON.stringify(['lasting for a very short time']), examples: JSON.stringify(['Fashions are ephemeral, changing with every season.']), category: 'GENERAL' },
            { text: 'serendipity', partOfSpeech: 'n.', meanings: JSON.stringify(['the occurrence of events by chance in a happy or beneficial way']), examples: JSON.stringify(['It was pure serendipity that we met at the coffee shop right before the rain started.']), category: 'GENERAL' },
            { text: 'obfuscate', partOfSpeech: 'v.', meanings: JSON.stringify(['render obscure, unclear, or unintelligible']), examples: JSON.stringify(['The spelling changes will deform some familiar words and obfuscate their etymological origins.']), category: 'TOEFL' },
            { text: 'resilient', partOfSpeech: 'adj.', meanings: JSON.stringify(['able to withstand or recover quickly from difficult conditions']), examples: JSON.stringify(['Babies are generally far more resilient than new parents realize.']), category: 'GENERAL' },
            { text: 'quintessential', partOfSpeech: 'adj.', meanings: JSON.stringify(['representing the most perfect or typical example of a quality or class']), examples: JSON.stringify(['He was the quintessential tough guy—strong, silent, and self-contained.']), category: 'GRE' }
        ];

        for (const w of initialWords) {
            await prisma.word.create({ data: w });
        }
        console.log('Seeded 5 words.');
    }
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
