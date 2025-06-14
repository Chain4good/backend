import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  InternalServerErrorException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service';
import { UserRegisterDTO } from './dtos/user-register.dto';
import { RefreshTokenService } from './refresh-token.service';
import { VerifyOTPDto } from './dtos/verify-otp.dto';
import { OTPService } from 'src/otp/otp.service';
import { RoleService } from 'src/role/role.service';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private otpService: OTPService,
    private refreshTokenService: RefreshTokenService,
    private roleService: RoleService, // Ensure RoleService is injected
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
    const userRecord = await this.usersService.findByEmail(user.email);
    if (!userRecord) {
      throw new UnauthorizedException('Invalid email or password');
    }
    if (!userRecord.isVerified) {
      throw new UnauthorizedException('Email not verified');
    }
    if (!userRecord.isActive) {
      throw new UnauthorizedException('User is blocked');
    }
    const role = await this.roleService.findOneBy({ id: userRecord.roleId });
    if (!role) {
      throw new InternalServerErrorException('Role not found');
    }
    if (role.name !== 'USER' && role.name !== 'ADMIN') {
      throw new UnauthorizedException('Unauthorized role');
    }
    const payload = {
      email: user.email,
      sub: user.id,
      role: role.name,
    };
    const accessToken = this.jwtService.sign(payload);

    const refreshToken = await this.refreshTokenService.createRefreshToken(
      user.id,
    );

    return {
      user: { ...user, role: role.name },
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
    const role = await this.roleService.findOneBy({ id: user.roleId });
    if (!role) {
      throw new InternalServerErrorException('Role not found');
    }
    if (role.name !== 'USER' && role.name !== 'ADMIN') {
      throw new UnauthorizedException('Unauthorized role');
    }
    if (!user.isActive) {
      throw new UnauthorizedException('User is blocked');
    }
    if (!user.isVerified) {
      throw new UnauthorizedException('Email not verified');
    }

    const payload = { email: user.email, sub: user.id, role: role.name };
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

    const defaultRole = await this.roleService.findOneBy({ name: 'USER' });

    if (!defaultRole) {
      throw new InternalServerErrorException('Default role "USER" not found');
    }

    const user = await this.usersService.create({
      ...userData,
      isVerified: true,
      roleId: defaultRole.id,
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
