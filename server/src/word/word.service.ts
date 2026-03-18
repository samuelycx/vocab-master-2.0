import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Word } from '@prisma/client';

@Injectable()
export class WordService {
    constructor(private prisma: PrismaService) { }

    async getWordsForSession(count: number = 10, category?: string): Promise<Word[]> {
        if (category && category !== 'GENERAL') {
            const scopedWords = await this.prisma.word.findMany({
                where: { category },
                take: count,
            });
            if (scopedWords.length > 0) {
                return this.shuffle(scopedWords).slice(0, count);
            }
        }

        const words = await this.prisma.word.findMany({
            take: Math.max(count, 50),
        });
        return this.shuffle(words).slice(0, count);
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

    private shuffle(words: Word[]) {
        return [...words].sort(() => Math.random() - 0.5);
    }
}
