import { Body, Controller, Get, Headers, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto, RegisterDto } from './dto/auth.dto';

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
}
