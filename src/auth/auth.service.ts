import {
  Injectable,
  UnauthorizedException,
  ConflictException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service';
import { UserRegisterDTO } from './dtos/user-register.dto';
import { RefreshTokenService } from './refresh-token.service';
import { VerifyOTPDto } from './dtos/verify-otp.dto';
import { OTPService } from 'src/otp/otp.service';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private otpService: OTPService,
    private refreshTokenService: RefreshTokenService,
  ) {}

  async validateUser(email: string, password: string): Promise<any> {
    const user = await this.usersService.findByEmail(email);
    if (user && (await bcrypt.compare(password, user.password))) {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { password, ...result } = user;
      return result;
    }
    return null;
  }

  async login(user: { email: string; id: number }) {
    const payload = { email: user.email, sub: user.id };
    const accessToken = this.jwtService.sign(payload);

    const refreshToken = await this.refreshTokenService.createRefreshToken(
      user.id,
    );

    return {
      user,
      access_token: accessToken,
      refresh_token: refreshToken,
    };
  }

  async refreshAccessToken(refreshToken: string) {
    const user =
      await this.refreshTokenService.validateRefreshToken(refreshToken);
    if (!user) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    const payload = { email: user.email, sub: user.id };
    const accessToken = this.jwtService.sign(payload);

    return {
      access_token: accessToken,
    };
  }

  async logout(refreshToken: string) {
    await this.refreshTokenService.deleteRefreshToken(refreshToken);
  }

  async register(data: UserRegisterDTO) {
    const existingUser = await this.usersService.findByEmail(data.email);
    if (existingUser) {
      throw new ConflictException('Email already exists');
    }

    // Generate and send OTP
    await this.otpService.generateOTP(data.email);

    // Store user data temporarily (you may want to use Redis here)
    // For now, we'll hash the password but not create the user yet
    const hashedPassword = await bcrypt.hash(data.password, 10);
    return {
      message: 'OTP sent to your email',
      data: {
        ...data,
        password: hashedPassword,
      },
    };
  }

  async verifyEmailAndCreateUser(
    verifyOTPDto: VerifyOTPDto,
    userData: UserRegisterDTO,
  ) {
    const isValid = await this.otpService.verifyOTP(
      verifyOTPDto.email,
      verifyOTPDto.code,
    );

    if (!isValid) {
      throw new UnauthorizedException('Invalid or expired OTP');
    }

    const user = await this.usersService.create({
      ...userData,
      isVerified: true,
    });

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password: _, ...result } = user;
    return result;
  }

  async getMe(id: number) {
    const user = await this.usersService.findById(id);
    if (!user) {
      throw new Error('User not found');
    }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...result } = user;
    return result;
  }
}
