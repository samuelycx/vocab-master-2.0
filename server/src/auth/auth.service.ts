import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AuthService {
    constructor(private prisma: PrismaService) { }

    async login(username: string) {
        const user = await this.prisma.user.findUnique({
            where: { username },
        });
        if (!user) {
            // Auto-register for simplicity or return error? 
            // For this app, let's treat login as "get or create" mostly, or separate.
            // The user spec said "Simple login".
            return { success: false, message: 'User not found. Please create one.' };
        }

        if (user.role === 'BANNED') {
            return { success: false, message: 'Your account has been suspended.' };
        }

        return { success: true, user };
    }

    async createUser(username: string) {
        try {
            const user = await this.prisma.user.create({
                data: {
                    username,
                    level: 1,
                    coins: 0
                },
            });
            return { success: true, user };
        } catch (e) {
            if (e.code === 'P2002') {
                throw new BadRequestException('Username already taken');
            }
            throw e;
        }
    }
}
