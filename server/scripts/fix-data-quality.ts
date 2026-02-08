import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';

const prisma = new PrismaClient();

async function main() {
    const words = await prisma.word.findMany();
    let updatedCount = 0;
    const missingPosList: string[] = [];

    for (const word of words) {
        let needsUpdate = false;
        let newMeaning = word.meanings;
        let newPOS = word.partOfSpeech;

        // 1. Clean Meaning
        // Remove leading/trailing brackets, quotes, dots, spaces
        // e.g. "] 公正地" -> "公正地", "["工具"]" -> "工具"
        // Also remove `["` at start and `"]` at end if present
        let cleanMeaning = newMeaning;

        // Remove known artifacts
        cleanMeaning = cleanMeaning.replace(/^[\s\[\]"']+|[\s\[\]"']+$|^\.+/g, '');

        // Fix double encoded JSON like "[""meaning""]"
        // Note: The previous clean might have handled it, but let's be safe
        // If it starts with a quote and ends with a quote, strip them
        if (cleanMeaning.startsWith('"') && cleanMeaning.endsWith('"')) {
            cleanMeaning = cleanMeaning.slice(1, -1);
        }

        if (cleanMeaning !== newMeaning) {
            // console.log(`[Clean] ${word.text}: "${newMeaning}" -> "${cleanMeaning}"`);
            newMeaning = cleanMeaning;
            needsUpdate = true;
        }

        // 2. Infer POS if missing
        if (!newPOS) {
            const posRegex = /^(n\.|v\.|adj\.|adv\.|prep\.|conj\.|pron\.|num\.|art\.|int\.|vt\.|vi\.)\s*(.*)/;
            const match = newMeaning.match(posRegex);
            if (match) {
                newPOS = match[1];
                newMeaning = match[2];
                needsUpdate = true;
            } else {
                missingPosList.push(word.text);
            }
        }

        if (needsUpdate) {
            await prisma.word.update({
                where: { id: word.id },
                data: {
                    meanings: newMeaning,
                    partOfSpeech: newPOS
                }
            });
            updatedCount++;
        }
    }

    console.log(`Finished. Updated ${updatedCount} words.`);
    console.log(`Missing POS for ${missingPosList.length} words.`);

    // Write missing list to file
    fs.writeFileSync('missing_pos_words.json', JSON.stringify(missingPosList, null, 2));
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
