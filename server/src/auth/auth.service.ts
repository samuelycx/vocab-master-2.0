import {
    BadRequestException,
    Injectable,
    UnauthorizedException,
} from '@nestjs/common';
import { randomBytes, scryptSync, timingSafeEqual } from 'crypto';
import { PrismaService } from '../prisma/prisma.service';
import { LoginDto, RegisterDto } from './dto/auth.dto';

const SESSION_TTL_MS = 1000 * 60 * 60 * 24 * 7;

@Injectable()
export class AuthService {
    constructor(private prisma: PrismaService) { }

    async register(body: RegisterDto) {
        const username = this.normalizeUsername(body?.username);
        const password = this.normalizePassword(body?.password);

        const existing = await this.prisma.user.findUnique({
            where: { username },
        });
        if (existing) {
            throw new BadRequestException('Username already taken');
        }

        const passwordHash = this.hashPassword(password);
        const session = this.createSession();

        const user = await this.prisma.user.create({
            data: {
                username,
                passwordHash,
                sessionToken: session.token,
                sessionExpiresAt: session.expiresAt,
                level: 1,
                coins: 0,
            },
        });

        return {
            success: true,
            token: session.token,
            user: this.toSafeUser(user),
        };
    }

    async login(body: LoginDto) {
        const username = this.normalizeUsername(body?.username);
        const password = this.normalizePassword(body?.password);

        const user = await this.prisma.user.findUnique({
            where: { username },
        });
        if (!user || !user.passwordHash) {
            throw new UnauthorizedException('Invalid username or password');
        }

        if (user.role === 'BANNED') {
            throw new UnauthorizedException('Your account has been suspended.');
        }

        const verified = this.verifyPassword(password, user.passwordHash);
        if (!verified) {
            throw new UnauthorizedException('Invalid username or password');
        }

        const session = this.createSession();
        const nextUser = await this.prisma.user.update({
            where: { id: user.id },
            data: {
                sessionToken: session.token,
                sessionExpiresAt: session.expiresAt,
            },
        });

        return {
            success: true,
            token: session.token,
            user: this.toSafeUser(nextUser),
        };
    }

    async getCurrentUser(authorization?: string) {
        const user = await this.requireUserFromAuthorization(authorization);
        return {
            success: true,
            user: this.toSafeUser(user),
        };
    }

    async logout(authorization?: string) {
        const user = await this.requireUserFromAuthorization(authorization);
        await this.prisma.user.update({
            where: { id: user.id },
            data: {
                sessionToken: null,
                sessionExpiresAt: null,
            },
        });
        return { success: true };
    }

    async requireUserFromAuthorization(authorization?: string) {
        const token = this.extractBearerToken(authorization);
        if (!token) {
            throw new UnauthorizedException('Missing authorization token');
        }

        const user = await this.prisma.user.findFirst({
            where: { sessionToken: token },
        });
        if (!user || !user.sessionExpiresAt || user.sessionExpiresAt.getTime() < Date.now()) {
            throw new UnauthorizedException('Session expired or invalid');
        }
        if (user.role === 'BANNED') {
            throw new UnauthorizedException('Your account has been suspended.');
        }
        return user;
    }

    private extractBearerToken(authorization?: string) {
        const value = String(authorization || '').trim();
        if (!value) return '';
        const match = value.match(/^Bearer\s+(.+)$/i);
        return match ? match[1].trim() : '';
    }

    private normalizeUsername(value?: string) {
        const username = String(value || '').trim();
        if (username.length < 3 || username.length > 24) {
            throw new BadRequestException('Username must be 3-24 characters');
        }
        if (!/^[a-zA-Z0-9_]+$/.test(username)) {
            throw new BadRequestException('Username can only contain letters, numbers, and underscore');
        }
        return username;
    }

    private normalizePassword(value?: string) {
        const password = String(value || '');
        if (password.length < 6 || password.length > 64) {
            throw new BadRequestException('Password must be 6-64 characters');
        }
        return password;
    }

    private hashPassword(password: string) {
        const salt = randomBytes(16).toString('hex');
        const hash = scryptSync(password, salt, 64).toString('hex');
        return `${salt}:${hash}`;
    }

    private verifyPassword(password: string, storedHash: string) {
        const [salt, originalHash] = String(storedHash || '').split(':');
        if (!salt || !originalHash) return false;
        const hashed = scryptSync(password, salt, 64);
        const original = Buffer.from(originalHash, 'hex');
        if (hashed.length !== original.length) return false;
        return timingSafeEqual(hashed, original);
    }

    private createSession() {
        return {
            token: randomBytes(32).toString('hex'),
            expiresAt: new Date(Date.now() + SESSION_TTL_MS),
        };
    }

    private toSafeUser(user: any) {
        const { passwordHash, sessionToken, sessionExpiresAt, ...safeUser } = user;
        return safeUser;
    }
}
