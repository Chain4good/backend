import { Body, Controller, Get, Post, Res, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { GetUser } from './decorators/auth.decorators';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { UserRegisterDTO } from './dtos/user-register.dto';
import { Response } from 'express';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @UseGuards(LocalAuthGuard)
  @Post('login')
  login(
    @GetUser() userReq: { email: string; id: number },
    @Res({ passthrough: true }) res: Response,
  ) {
    const { user, access_token } = this.authService.login(userReq);
    res.cookie('access_token', access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 24 * 60 * 60 * 1000,
    });
    return user;
  }

  @Post('register')
  async register(
    @Body()
    userRegisterDto: UserRegisterDTO,
  ) {
    return this.authService.register(userRegisterDto);
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  getProfile(@GetUser() user: { id: number; email: string }) {
    const existingUser = this.authService.getMe(user.id);
    return existingUser;
  }
}
