import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  InternalServerErrorException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service';
import { UserRegisterDTO } from './dtos/user-register.dto';
import { RefreshTokenService } from './refresh-token.service';
import { VerifyOTPDto } from './dtos/verify-otp.dto';
import { OTPService } from 'src/otp/otp.service';
import { RoleService } from 'src/role/role.service';
import { verifyMessage } from 'ethers';
import { PrismaService } from 'src/prisma/prisma.service';
import { ConfigService } from '@nestjs/config';

interface FacebookUser {
  email: string;
  name: string;
  image?: string;
  facebookAccessToken: string;
}

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private otpService: OTPService,
    private refreshTokenService: RefreshTokenService,
    private roleService: RoleService,
    private prisma: PrismaService,
    private configService: ConfigService,
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

  async web3Login(address: string, signature: string) {
    const message = `Chain4Good login: ${address}`;

    const recoveredAddress = verifyMessage(message, signature);
    if (recoveredAddress.toLowerCase() !== address.toLowerCase()) {
      throw new UnauthorizedException('Invalid signature');
    }

    let user = await this.usersService.findByAddress(address);
    if (!user) {
      user = await this.usersService.create({
        address,
        name: 'Người dùng Web3',
        email: `${address}@web3.io`,
        isVerified: true,
        isActive: true,
        password: '', // or null
        roleId: (await this.roleService.findOneBy({ name: 'USER' }))?.id,
      });
    }

    const payload = { sub: user.id, email: user.email, role: 'USER' };
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

  async validateGoogleUser(googleData: {
    email: string;
    name: string;
    image?: string;
  }) {
    try {
      let user = await this.prisma.user.findUnique({
        where: { email: googleData.email },
        include: { role: true },
      });

      if (!user) {
        // Get default USER role first
        const defaultRole = await this.prisma.role.findUnique({
          where: { name: 'USER' },
        });

        if (!defaultRole) {
          throw new InternalServerErrorException(
            'Default role "USER" not found',
          );
        }

        // Create new user if doesn't exist
        const createdUser = await this.prisma.user.create({
          data: {
            email: googleData.email,
            name: googleData.name,
            image: googleData.image || '',
            isVerified: true,
            isActive: true,
            password: '',
            // Use address derived from email for Google users
            address: `google_${googleData.email.replace('@', '_')}`,
            roleId: defaultRole.id,
          },
          include: {
            role: true,
          },
        });

        user = createdUser;
      }

      if (!user || !user.role) {
        throw new UnauthorizedException('Failed to create/retrieve user');
      }

      const refreshToken = await this.refreshTokenService.createRefreshToken(
        user.id,
      );

      // Generate tokens
      const payload = {
        email: user.email,
        sub: user.id,
        role: user.role.name,
      };

      const access_token = this.jwtService.sign(payload);

      return {
        user,
        access_token,
        refresh_token: refreshToken,
      };
    } catch (error) {
      if (error instanceof UnauthorizedException || error instanceof InternalServerErrorException) {
        throw error;
      }
      throw new UnauthorizedException('Google authentication failed');
    }
  }

  async unlinkGoogle(userId: number) {
    try {
      // Check if user exists and was created with Google
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
        include: { role: true },
      });

      if (!user) {
        throw new NotFoundException('User not found');
      }

      // Check if email contains @gmail.com
      if (!user.email.endsWith('@gmail.com')) {
        throw new BadRequestException(
          'This account was not created with Google',
        );
      }

      // Generate temporary email and clear Google-specific data
      const tempEmail = `unlinked_${user.id}_${Date.now()}@temp.com`;

      await this.prisma.user.update({
        where: { id: userId },
        data: {
          email: tempEmail,
          image: null, // Clear Google profile image
          isVerified: false, // Require new verification for future email
        },
      });

      // Revoke all existing tokens
      await this.refreshTokenService.revokeAllUserTokens(userId);

      return { message: 'Google account unlinked successfully' };
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to unlink Google account');
    }
  }

  async validateFacebookUser(facebookUser: FacebookUser) {
    try {
      let user = await this.prisma.user.findUnique({
        where: { email: facebookUser.email },
        include: { role: true },
      });

      if (!user) {
        const defaultRole = await this.prisma.role.findUnique({
          where: { name: 'USER' },
        });

        if (!defaultRole) {
          throw new InternalServerErrorException(
            'Default role "USER" not found',
          );
        }

        // Create new user if doesn't exist
        const createdUser = await this.prisma.user.create({
          data: {
            email: facebookUser.email,
            name: facebookUser.name,
            image: facebookUser.image || '',
            isVerified: true,
            isActive: true,
            password: '',
            address: `facebook_${facebookUser.email.replace('@', '_')}`,
            roleId: defaultRole.id,
          },
          include: {
            role: true,
          },
        });

        user = createdUser;
      }

      if (!user || !user.role) {
        throw new UnauthorizedException('Failed to create/retrieve user');
      }

      const refreshToken = await this.refreshTokenService.createRefreshToken(
        user.id,
      );

      const payload = {
        email: user.email,
        sub: user.id,
        role: user.role.name,
      };

      const access_token = this.jwtService.sign(payload);

      return {
        user,
        access_token,
        refresh_token: refreshToken,
      };
    } catch (error) {
      if (error instanceof UnauthorizedException || error instanceof InternalServerErrorException) {
        throw error;
      }
      throw new UnauthorizedException('Facebook authentication failed');
    }
  }
}
