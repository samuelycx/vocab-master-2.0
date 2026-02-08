import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AdminService {
    constructor(private prisma: PrismaService) { }

    async createWord(data: any) {
        return this.prisma.word.create({
            data: {
                text: data.text,
                partOfSpeech: data.partOfSpeech,
                meanings: data.meanings, // Already JSON string from frontend
                examples: data.examples,   // Already JSON string from frontend
                category: data.category
            }
        });
    }

    async deleteWord(id: string) {
        return this.prisma.word.delete({
            where: { id }
        });
    }

    async getUsers() {
        return this.prisma.user.findMany({
            orderBy: { xp: 'desc' }
        });
    }

    async setUserCategory(userId: string, category: string) {
        return this.prisma.user.update({
            where: { id: userId },
            data: { targetCategory: category }
        });
    }

    async getSystemConfigs() {
        const configs = await this.prisma.systemConfig.findMany();
        // Convert array to object for easier frontend consumption
        return configs.reduce((acc: Record<string, boolean>, curr) => {
            acc[curr.key] = curr.value === 'true';
            return acc;
        }, {} as Record<string, boolean>);
    }

    async toggleModule(key: string, enabled: boolean) {
        return this.prisma.systemConfig.upsert({
            where: { key },
            update: { value: String(enabled) },
            create: { key, value: String(enabled) }
        });
    }
}
