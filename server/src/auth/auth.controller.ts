import { Body, Controller, Get, Headers, Patch, Post, UploadedFile, UseInterceptors } from '@nestjs/common';
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
    @UseInterceptors(FileInterceptor('avatar', createAvatarUploadOptions()))
    async updateProfile(
        @Headers('authorization') authorization: string,
        @Body() body: UpdateProfileDto,
        @UploadedFile() file?: any,
    ) {
        const user = await this.authService.requireUserFromAuthorization(authorization);
        const avatarUpdate = file?.filename
            ? {
                avatarUrl: buildAvatarPublicUrl(file.filename),
                previousAvatarUrl: user.avatar,
            }
            : undefined;
        return this.authService.updateProfile(user.id, body, avatarUpdate);
    }
}
