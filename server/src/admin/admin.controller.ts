import { Controller, Post, Delete, Get, Body, Param, Query, Headers } from '@nestjs/common';
import { AdminService } from './admin.service';
import { PrismaService } from '../prisma/prisma.service';
import { AuthService } from '../auth/auth.service';

@Controller('admin')
export class AdminController {
    constructor(
        private readonly adminService: AdminService,
        private readonly prisma: PrismaService,
        private readonly authService: AuthService,
    ) { }

    @Post('word')
    async createWord(@Body() data: any, @Headers('authorization') authorization?: string) {
        await this.requireAdmin(authorization);
        return this.adminService.createWord(data);
    }

    @Post('words/import')
    async importWords(@Body() words: any[], @Headers('authorization') authorization?: string) {
        await this.requireAdmin(authorization);
        // Bulk create words
        // Use transaction or createMany
        // For SQLite, createMany is supported
        let count = 0;
        for (const w of words) {
            // Check if exists
            const exists = await this.prisma.word.findFirst({ where: { text: w.text } });
            if (!exists) {
                await this.prisma.word.create({ data: w });
                count++;
            }
        }
        return { count };
    }

    @Get('words/export')
    async exportWords(@Headers('authorization') authorization?: string) {
        await this.requireAdmin(authorization);
        return this.prisma.word.findMany();
    }

    @Delete('word/:id')
    async deleteWord(@Param('id') id: string, @Headers('authorization') authorization?: string) {
        await this.requireAdmin(authorization);
        return this.adminService.deleteWord(id);
    }

    @Get('users')
    async getUsers(@Headers('authorization') authorization?: string) {
        await this.requireAdmin(authorization);
        const users = await this.adminService.getUsers();
        return users.map((user) => this.authService.sanitizeUser(user));
    }

    @Post('user/:id/ban')
    async banUser(@Param('id') id: string, @Headers('authorization') authorization?: string) {
        await this.requireAdmin(authorization);
        // Since we don't have an 'isActive' field yet, we might use a role change or just delete
        // Let's toggle role to 'BANNED' or similar if schema supports, or just prefix username
        // For now, let's just assume we delete them for "Ban" as per simplicity, or add a field.
        // Checking schema... user has 'role'.
        const user = await this.prisma.user.findUnique({ where: { id } });
        if (user) {
            const newRole = user.role === 'BANNED' ? 'USER' : 'BANNED';
            return this.prisma.user.update({
                where: { id },
                data: { role: newRole }
            });
        }
        return { error: 'User not found' };
    }

    @Post('set-category')
    async setUserCategory(
        @Body() body: { userId: string, category: string },
        @Headers('authorization') authorization?: string,
    ) {
        await this.requireAdmin(authorization);
        return this.adminService.setUserCategory(body.userId, body.category);

    }

    @Get('configs')
    async getConfigs(@Headers('authorization') authorization?: string) {
        await this.requireAdmin(authorization);
        return this.adminService.getSystemConfigs();
    }

    @Post('module/toggle')
    async toggleModule(
        @Body() body: { key: string, enabled: boolean },
        @Headers('authorization') authorization?: string,
    ) {
        await this.requireAdmin(authorization);
        return this.adminService.toggleModule(body.key, body.enabled);
    }

    private async requireAdmin(authorization?: string) {
        await this.authService.requireAdminFromAuthorization(authorization);
    }
}
