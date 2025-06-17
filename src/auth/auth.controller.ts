import {
  Body,
  Controller,
  Get,
  Post,
  Res,
  UseGuards,
  Req,
  UnauthorizedException,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { GetUser } from './decorators/auth.decorators';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { UserRegisterDTO } from './dtos/user-register.dto';
import { Response, Request } from 'express';
import { VerifyOTPDto } from './dtos/verify-otp.dto';
import { OTPService } from 'src/otp/otp.service';
import { AuthGuard } from '@nestjs/passport';
import { ConfigService } from '@nestjs/config';

@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private otpService: OTPService,
    private configService: ConfigService,
  ) {}

  @UseGuards(LocalAuthGuard)
  @Post('login')
  async login(
    @GetUser() userReq: { email: string; id: number },
    @Res({ passthrough: true }) res: Response,
  ) {
    try {
      const { user, access_token, refresh_token } =
        await this.authService.login(userReq);

      res.cookie('access_token', access_token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 1 * 60 * 60 * 1000, // 1 hour
      });

      res.cookie('refresh_token', refresh_token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      });

      return user;
    } catch (error) {
      console.log('Login error:', error);
      throw error;
    }
  }

  @Post('web3-login')
  async web3Login(
    @Body() body: { address: string; signature: string },
    @Res({ passthrough: true }) res: Response,
  ) {
    const { access_token, refresh_token, user } =
      await this.authService.web3Login(body.address, body.signature);

    res.cookie('access_token', access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 1 * 60 * 60 * 1000, // 1 hour
    });

    res.cookie('refresh_token', refresh_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });
    return user;
  }

  @Post('refresh')
  async refresh(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
    const refreshToken = req.cookies['refresh_token'];
    if (!refreshToken) {
      throw new UnauthorizedException('Refresh token not found');
    }

    const { access_token } =
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      await this.authService.refreshAccessToken(refreshToken);

    res.cookie('access_token', access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 1 * 60 * 60 * 1000, // 1 hour
    });

    return { message: 'Token refreshed successfully' };
  }

  @UseGuards(JwtAuthGuard)
  @Post('logout')
  async logout(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
    const refreshToken = req.cookies['refresh_token'];
    if (refreshToken) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      await this.authService.logout(refreshToken);
    }

    res.clearCookie('access_token');
    res.clearCookie('refresh_token');

    return { message: 'Logged out successfully' };
  }

  @Post('register')
  async register(@Body() userRegisterDto: UserRegisterDTO) {
    return this.authService.register(userRegisterDto);
  }

  @Post('verify-email')
  async verifyEmail(
    @Body() verifyOTPDto: VerifyOTPDto,
    @Body('userData') userData: UserRegisterDTO,
  ) {
    return this.authService.verifyEmailAndCreateUser(verifyOTPDto, userData);
  }

  @Post('resend-otp')
  async resendOTP(@Body('email') email: string) {
    await this.otpService.generateOTP(email);
    return { message: 'OTP resent successfully' };
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  getProfile(@GetUser() user: { id: number; email: string }) {
    const existingUser = this.authService.getMe(user.id);
    return existingUser;
  }

  @Get('google')
  @UseGuards(AuthGuard('google'))
  async googleAuth() {
    // This will redirect to Google login page
  }

  @Get('google/redirect')
  @UseGuards(AuthGuard('google'))
  // eslint-disable-next-line @typescript-eslint/require-await
  async googleAuthRedirect(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    try {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const { user, access_token, refresh_token } = req.user as any;

      res.cookie('access_token', access_token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 1 * 60 * 60 * 1000,
      });

      res.cookie('refresh_token', refresh_token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      res.redirect(`${this.configService.get('FRONTEND_URL')}`);
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      res.redirect(
        `${this.configService.get('FRONTEND_URL')}/login?error=google_auth_failed`,
      );
    }
  }

  @Post('google/unlink')
  @UseGuards(JwtAuthGuard)
  async unlinkGoogle(
    @GetUser() user: { id: number },
    @Res({ passthrough: true }) res: Response,
  ) {
    try {
      await this.authService.unlinkGoogle(user.id);

      res.clearCookie('access_token', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
      });

      res.clearCookie('refresh_token', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
      });

      return { message: 'Google account unlinked successfully' };
    } catch (error) {
      throw new HttpException(
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access
        error.message || 'Failed to unlink Google account',
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('facebook')
  @UseGuards(AuthGuard('facebook'))
  async facebookAuth() {
    // Redirect to Facebook login
  }

  @Get('facebook/redirect')
  @UseGuards(AuthGuard('facebook'))
  // eslint-disable-next-line @typescript-eslint/require-await
  async facebookAuthRedirect(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    try {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const { user, access_token, refresh_token } = req.user as any;

      res.cookie('access_token', access_token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 1 * 60 * 60 * 1000, // 1 hour
      });

      res.cookie('refresh_token', refresh_token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      });

      res.redirect(`${this.configService.get('FRONTEND_URL')}`);
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      res.redirect(
        `${this.configService.get('FRONTEND_URL')}/login?error=facebook_auth_failed`,
      );
    }
  }
}
