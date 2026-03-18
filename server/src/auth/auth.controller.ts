import { BadRequestException, Body, Controller, Get, Headers, Patch, Post, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { AuthService } from './auth.service';
import { LoginDto, RegisterDto, UpdateProfileDto } from './dto/auth.dto';
import { buildAvatarPublicUrl, createAvatarUploadOptions } from './avatar-upload';

@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) { }

    @Post('login')
    async login(@Body() body: LoginDto) {
        return this.authService.login(body);
    }

    @Post('register')
    async register(@Body() body: RegisterDto) {
        return this.authService.register(body);
    }

    @Get('me')
    async me(@Headers('authorization') authorization?: string) {
        return this.authService.getCurrentUser(authorization);
    }

    @Post('logout')
    async logout(@Headers('authorization') authorization?: string) {
        return this.authService.logout(authorization);
    }

    @Patch('profile')
    async updateProfile(
        @Headers('authorization') authorization: string,
        @Body() body: UpdateProfileDto,
    ) {
        const user = await this.authService.requireUserFromAuthorization(authorization);
        return this.authService.updateProfile(user.id, body);
    }

    @Post('avatar')
    @UseInterceptors(FileInterceptor('avatar', createAvatarUploadOptions()))
    async uploadAvatar(
        @Headers('authorization') authorization: string,
        @UploadedFile() file: any,
    ) {
        const user = await this.authService.requireUserFromAuthorization(authorization);
        if (!file?.filename) {
            throw new BadRequestException('Avatar file is required');
        }
        const avatarUrl = buildAvatarPublicUrl(file.filename);
        return this.authService.updateAvatar(user.id, avatarUrl);
    }
}
