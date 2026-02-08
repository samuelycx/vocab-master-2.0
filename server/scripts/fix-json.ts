
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('Fixing invalid JSON in meanings and examples...');
    const words = await prisma.word.findMany();
    let fixedCount = 0;

    for (const word of words) {
        let needsUpdate = false;
        let newMeanings = word.meanings;
        let newExamples = word.examples;

        // Check Meanings
        try {
            JSON.parse(word.meanings);
        } catch (e) {
            // Not valid JSON, assume raw string
            console.log(`Fixing meanings for word: ${word.text} (${word.meanings})`);
            // Wrap in array. 
            // Escape quotes if needed?
            // If it's a simple string, we can just start with [ and end with ]?
            // Safer to use JSON.stringify([word.meanings])?
            // But word.meanings is the raw string from DB.
            // If DB has "发明", then valid JSON is "[\"发明\"]".
            // So we want to stringify the array containing the raw string.
            newMeanings = JSON.stringify([word.meanings]);
            needsUpdate = true;
        }

        // Check Examples
        try {
            JSON.parse(word.examples);
        } catch (e) {
            console.log(`Fixing examples for word: ${word.text} (${word.examples})`);
            newExamples = JSON.stringify([word.examples]);
            needsUpdate = true;
        }

        if (needsUpdate) {
            await prisma.word.update({
                where: { id: word.id },
                data: {
                    meanings: newMeanings,
                    examples: newExamples
                }
            });
            fixedCount++;
        }
    }

    console.log(`Fixed ${fixedCount} words.`);
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
