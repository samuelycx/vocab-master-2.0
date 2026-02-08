import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Word } from '@prisma/client';

@Injectable()
export class WordService {
    constructor(private prisma: PrismaService) { }

    async getWordsForSession(count: number = 10, category?: string): Promise<Word[]> {
        let words: Word[] = [];
        if (category && category !== 'GENERAL') {
            words = await this.prisma.$queryRawUnsafe<Word[]>(`SELECT * FROM Word WHERE category = '${category}' ORDER BY RANDOM() LIMIT ${count}`);
        }

        // Fallback if no words found in category or category is GENERAL
        if (words.length === 0) {
            words = await this.prisma.$queryRaw<Word[]>`SELECT * FROM Word ORDER BY RANDOM() LIMIT ${count}`;
        }
        return words;
    }

    async createWord(data: any): Promise<Word> {
        return this.prisma.word.create({ data });
    }

    async deleteWord(id: string): Promise<Word> {
        return this.prisma.word.delete({ where: { id } });
    }

    async findAll(category?: string): Promise<Word[]> {
        if (category) {
            return this.prisma.word.findMany({ where: { category } });
        }
        return this.prisma.word.findMany();
    }
}
