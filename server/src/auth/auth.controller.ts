import { Controller, Post, Body, Get, Query } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/auth.dto';

@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) { }

    @Post('login')
    async login(@Body() body: LoginDto) {
        return this.authService.login(body.username);
    }

    @Post('create')
    async create(@Body() body: LoginDto) {
        return this.authService.createUser(body.username);
    }
}
