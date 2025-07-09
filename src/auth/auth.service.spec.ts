import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { OTPService } from 'src/otp/otp.service';
import { RefreshTokenService } from './refresh-token.service';
import { RoleService } from 'src/role/role.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import {
  UnauthorizedException,
  ConflictException,
  InternalServerErrorException,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { User } from '@prisma/client';
import { verifyMessage } from 'ethers';

jest.mock('bcrypt');
jest.mock('ethers', () => ({
  verifyMessage: jest.fn(),
}));

describe('AuthService', () => {
  let service: AuthService;
  let usersService: UsersService;
  let jwtService: JwtService;
  let otpService: OTPService;
  let refreshTokenService: RefreshTokenService;
  let roleService: RoleService;
  let prismaService: PrismaService;
  let configService: ConfigService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UsersService,
          useValue: {
            findByEmail: jest.fn(),
            findById: jest.fn(),
            findByAddress: jest.fn(),
            create: jest.fn(),
          },
        },
        {
          provide: JwtService,
          useValue: {
            sign: jest.fn(),
          },
        },
        {
          provide: OTPService,
          useValue: {
            generateOTP: jest.fn(),
            verifyOTP: jest.fn(),
          },
        },
        {
          provide: RefreshTokenService,
          useValue: {
            createRefreshToken: jest.fn(),
            validateRefreshToken: jest.fn(),
            deleteRefreshToken: jest.fn(),
            revokeAllUserTokens: jest.fn(),
          },
        },
        {
          provide: RoleService,
          useValue: {
            findOneBy: jest.fn(),
          },
        },
        {
          provide: PrismaService,
          useValue: {
            user: {
              findUnique: jest.fn(),
              create: jest.fn(),
              update: jest.fn(),
            },
            role: {
              findUnique: jest.fn(),
            },
          },
        },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key: string) => {
              if (key === 'JWT_SECRET') return 'test_secret';
              return null;
            }),
          },
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    usersService = module.get<UsersService>(UsersService);
    jwtService = module.get<JwtService>(JwtService);
    otpService = module.get<OTPService>(OTPService);
    refreshTokenService = module.get<RefreshTokenService>(RefreshTokenService);
    roleService = module.get<RoleService>(RoleService);
    prismaService = module.get<PrismaService>(PrismaService);
    configService = module.get<ConfigService>(ConfigService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('validateUser', () => {
    const email = 'test@example.com';
    const password = 'password';
    const hashedPassword = 'hashedPassword';
    const mockUser: User = {
      id: 1,
      email,
      password: hashedPassword,
      name: 'Test User',
      phoneNumber: null,
      address: '123 Main St',
      bio: null,
      image: null,
      cover: null,
      isVerified: true,
      isActive: true,
      kycStatus: 'PENDING',
      roleId: 1,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    it('should return user if validation succeeds', async () => {
      jest.spyOn(usersService, 'findByEmail').mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      const result = await service.validateUser(email, password);
      expect(result).toEqual(
        expect.objectContaining({ email: mockUser.email }),
      );
      expect(result).not.toHaveProperty('password');
      expect(usersService.findByEmail).toHaveBeenCalledWith(email);
      expect(bcrypt.compare).toHaveBeenCalledWith(password, hashedPassword);
    });

    it('should return null if password does not match', async () => {
      jest.spyOn(usersService, 'findByEmail').mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      const result = await service.validateUser(email, password);
      expect(result).toBeNull();
    });

    it('should return null if user not found', async () => {
      jest.spyOn(usersService, 'findByEmail').mockResolvedValue(null);

      const result = await service.validateUser(email, password);
      expect(result).toBeNull();
    });
  });

  describe('login', () => {
    const user = { id: 1, email: 'test@example.com' };
    const mockRole = { id: 1, name: 'USER', description: 'Standard User' };
    const mockUserRecord: User = {
      id: 1,
      email: 'test@example.com',
      password: 'hashedPassword',
      name: 'Test User',
      phoneNumber: null,
      address: '123 Main St',
      bio: null,
      image: null,
      cover: null,
      isVerified: true,
      isActive: true,
      kycStatus: 'PENDING',
      roleId: 1,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    it('should return access and refresh tokens on successful login', async () => {
      jest.spyOn(usersService, 'findByEmail').mockResolvedValue(mockUserRecord);
      jest.spyOn(roleService, 'findOneBy').mockResolvedValue(mockRole);
      jest.spyOn(jwtService, 'sign').mockReturnValue('access_token');
      jest
        .spyOn(refreshTokenService, 'createRefreshToken')
        .mockResolvedValue('refresh_token');

      const result = await service.login(user);

      expect(usersService.findByEmail).toHaveBeenCalledWith(user.email);
      expect(roleService.findOneBy).toHaveBeenCalledWith({
        id: mockUserRecord.roleId,
      });
      expect(jwtService.sign).toHaveBeenCalledWith({
        email: user.email,
        sub: user.id,
        role: mockRole.name,
      });
      expect(refreshTokenService.createRefreshToken).toHaveBeenCalledWith(
        user.id,
      );
      expect(result).toEqual({
        user: { ...user, role: mockRole.name },
        access_token: 'access_token',
        refresh_token: 'refresh_token',
      });
    });

    it('should throw UnauthorizedException if user record not found', async () => {
      jest.spyOn(usersService, 'findByEmail').mockResolvedValue(null);

      await expect(service.login(user)).rejects.toThrow(
        new UnauthorizedException('Invalid email or password'),
      );
    });

    it('should throw UnauthorizedException if email not verified', async () => {
      const unverifiedUser = { ...mockUserRecord, isVerified: false };
      jest.spyOn(usersService, 'findByEmail').mockResolvedValue(unverifiedUser);

      await expect(service.login(user)).rejects.toThrow(
        new UnauthorizedException('Email not verified'),
      );
    });

    it('should throw UnauthorizedException if user is blocked', async () => {
      const inactiveUser = { ...mockUserRecord, isActive: false };
      jest.spyOn(usersService, 'findByEmail').mockResolvedValue(inactiveUser);

      await expect(service.login(user)).rejects.toThrow(
        new UnauthorizedException('User is blocked'),
      );
    });

    it('should throw InternalServerErrorException if role not found', async () => {
      jest.spyOn(usersService, 'findByEmail').mockResolvedValue(mockUserRecord);
      jest.spyOn(roleService, 'findOneBy').mockResolvedValue(null);

      await expect(service.login(user)).rejects.toThrow(
        new InternalServerErrorException('Role not found'),
      );
    });

    it('should throw UnauthorizedException if role is not USER or ADMIN', async () => {
      const unauthorizedRole = {
        id: 2,
        name: 'GUEST',
        description: 'Guest User',
      };
      jest.spyOn(usersService, 'findByEmail').mockResolvedValue(mockUserRecord);
      jest.spyOn(roleService, 'findOneBy').mockResolvedValue(unauthorizedRole);

      await expect(service.login(user)).rejects.toThrow(
        new UnauthorizedException('Unauthorized role'),
      );
    });
  });

  describe('refreshAccessToken', () => {
    const refreshToken = 'some_refresh_token';
    const mockUser: User = {
      id: 1,
      email: 'test@example.com',
      password: 'hashedPassword',
      name: 'Test User',
      phoneNumber: null,
      address: '123 Main St',
      bio: null,
      image: null,
      cover: null,
      isVerified: true,
      isActive: true,
      kycStatus: 'PENDING',
      roleId: 1,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    const mockRole = { id: 1, name: 'USER', description: 'Standard User' };

    it('should return a new access token on successful refresh', async () => {
      jest
        .spyOn(refreshTokenService, 'validateRefreshToken')
        .mockResolvedValue(mockUser);
      jest.spyOn(roleService, 'findOneBy').mockResolvedValue(mockRole);
      jest.spyOn(jwtService, 'sign').mockReturnValue('new_access_token');

      const result = await service.refreshAccessToken(refreshToken);

      expect(refreshTokenService.validateRefreshToken).toHaveBeenCalledWith(
        refreshToken,
      );
      expect(roleService.findOneBy).toHaveBeenCalledWith({
        id: mockUser.roleId,
      });
      expect(jwtService.sign).toHaveBeenCalledWith({
        email: mockUser.email,
        sub: mockUser.id,
        role: mockRole.name,
      });
      expect(result).toEqual({ access_token: 'new_access_token' });
    });

    it('should throw UnauthorizedException if refresh token is invalid', async () => {
      jest
        .spyOn(refreshTokenService, 'validateRefreshToken')
        .mockResolvedValue(null);

      await expect(service.refreshAccessToken(refreshToken)).rejects.toThrow(
        new UnauthorizedException('Invalid refresh token'),
      );
    });

    it('should throw InternalServerErrorException if role not found', async () => {
      jest
        .spyOn(refreshTokenService, 'validateRefreshToken')
        .mockResolvedValue(mockUser);
      jest.spyOn(roleService, 'findOneBy').mockResolvedValue(null);

      await expect(service.refreshAccessToken(refreshToken)).rejects.toThrow(
        new InternalServerErrorException('Role not found'),
      );
    });

    it('should throw UnauthorizedException if role is not USER or ADMIN', async () => {
      const unauthorizedRole = {
        id: 2,
        name: 'GUEST',
        description: 'Guest User',
      };
      jest
        .spyOn(refreshTokenService, 'validateRefreshToken')
        .mockResolvedValue(mockUser);
      jest.spyOn(roleService, 'findOneBy').mockResolvedValue(unauthorizedRole);

      await expect(service.refreshAccessToken(refreshToken)).rejects.toThrow(
        new UnauthorizedException('Unauthorized role'),
      );
    });

    it('should throw UnauthorizedException if user is blocked', async () => {
      const inactiveUser = { ...mockUser, isActive: false };
      jest
        .spyOn(refreshTokenService, 'validateRefreshToken')
        .mockResolvedValue(inactiveUser);
      jest.spyOn(roleService, 'findOneBy').mockResolvedValue(mockRole);

      await expect(service.refreshAccessToken(refreshToken)).rejects.toThrow(
        new UnauthorizedException('User is blocked'),
      );
    });

    it('should throw UnauthorizedException if email not verified', async () => {
      const unverifiedUser = { ...mockUser, isVerified: false };
      jest
        .spyOn(refreshTokenService, 'validateRefreshToken')
        .mockResolvedValue(unverifiedUser);
      jest.spyOn(roleService, 'findOneBy').mockResolvedValue(mockRole);

      await expect(service.refreshAccessToken(refreshToken)).rejects.toThrow(
        new UnauthorizedException('Email not verified'),
      );
    });
  });

  describe('logout', () => {
    it('should delete the refresh token', async () => {
      const refreshToken = 'some_refresh_token';
      jest
        .spyOn(refreshTokenService, 'deleteRefreshToken')
        .mockResolvedValue(undefined);

      await service.logout(refreshToken);
      expect(refreshTokenService.deleteRefreshToken).toHaveBeenCalledWith(
        refreshToken,
      );
    });
  });

  describe('register', () => {
    const registerDto = {
      email: 'newuser@example.com',
      password: 'newpassword',
      name: 'New User',
      address: '456 Oak Ave',
    };

    it('should generate OTP and return temporary user data', async () => {
      jest.spyOn(usersService, 'findByEmail').mockResolvedValue(null);
      jest.spyOn(otpService, 'generateOTP').mockResolvedValue('123456');
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashedNewPassword');

      const result = await service.register(registerDto);

      expect(usersService.findByEmail).toHaveBeenCalledWith(registerDto.email);
      expect(otpService.generateOTP).toHaveBeenCalledWith(registerDto.email);
      expect(bcrypt.hash).toHaveBeenCalledWith(registerDto.password, 10);
      expect(result).toEqual({
        message: 'OTP sent to your email',
        data: { ...registerDto, password: 'hashedNewPassword' },
      });
    });

    it('should throw ConflictException if email already exists', async () => {
      jest.spyOn(usersService, 'findByEmail').mockResolvedValue({} as User);

      await expect(service.register(registerDto)).rejects.toThrow(
        new ConflictException('Email already exists'),
      );
    });
  });

  describe('verifyEmailAndCreateUser', () => {
    const verifyOTPDto = { email: 'newuser@example.com', code: '123456' };
    const userData = {
      email: 'newuser@example.com',
      password: 'hashedNewPassword',
      name: 'New User',
      address: '456 Oak Ave',
    };
    const mockRole = { id: 1, name: 'USER', description: 'Standard User' };
    const createdUser: User = {
      id: 2,
      email: userData.email,
      password: userData.password,
      name: userData.name,
      phoneNumber: null,
      address: userData.address,
      bio: null,
      image: null,
      cover: null,
      isVerified: true,
      isActive: true,
      kycStatus: 'PENDING',
      roleId: mockRole.id,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    it('should verify email and create user successfully', async () => {
      jest.spyOn(otpService, 'verifyOTP').mockResolvedValue(true);
      jest.spyOn(roleService, 'findOneBy').mockResolvedValue(mockRole);
      jest.spyOn(usersService, 'create').mockResolvedValue(createdUser);

      const result = await service.verifyEmailAndCreateUser(
        verifyOTPDto,
        userData,
      );

      expect(otpService.verifyOTP).toHaveBeenCalledWith(
        verifyOTPDto.email,
        verifyOTPDto.code,
      );
      expect(roleService.findOneBy).toHaveBeenCalledWith({ name: 'USER' });
      expect(usersService.create).toHaveBeenCalledWith({
        ...userData,
        isVerified: true,
        roleId: mockRole.id,
      });
      expect(result).toEqual(
        expect.objectContaining({ email: createdUser.email }),
      );
      expect(result).not.toHaveProperty('password');
    });

    it('should throw UnauthorizedException if OTP is invalid', async () => {
      jest.spyOn(otpService, 'verifyOTP').mockResolvedValue(false);

      await expect(
        service.verifyEmailAndCreateUser(verifyOTPDto, userData),
      ).rejects.toThrow(new UnauthorizedException('Invalid or expired OTP'));
    });

    it('should throw InternalServerErrorException if default role not found', async () => {
      jest.spyOn(otpService, 'verifyOTP').mockResolvedValue(true);
      jest.spyOn(roleService, 'findOneBy').mockResolvedValue(null);

      await expect(
        service.verifyEmailAndCreateUser(verifyOTPDto, userData),
      ).rejects.toThrow(
        new InternalServerErrorException('Default role "USER" not found'),
      );
    });
  });

  describe('getMe', () => {
    const userId = 1;
    const mockUser: User = {
      id: userId,
      email: 'test@example.com',
      password: 'hashedPassword',
      name: 'Test User',
      phoneNumber: null,
      address: '123 Main St',
      bio: null,
      image: null,
      cover: null,
      isVerified: true,
      isActive: true,
      kycStatus: 'PENDING',
      roleId: 1,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    it('should return user data without password', async () => {
      jest.spyOn(usersService, 'findById').mockResolvedValue(mockUser);

      const result = await service.getMe(userId);

      expect(usersService.findById).toHaveBeenCalledWith(userId);
      expect(result).toEqual(
        expect.objectContaining({ email: mockUser.email }),
      );
      expect(result).not.toHaveProperty('password');
    });

    it('should throw Error if user not found', async () => {
      jest.spyOn(usersService, 'findById').mockResolvedValue(null);

      await expect(service.getMe(userId)).rejects.toThrow('User not found');
    });
  });

  describe('web3Login', () => {
    const address = '0x123abc';
    const signature = 'some_signature';
    const message = `Chain4Good login: ${address}`;
    const mockUser: User = {
      id: 1,
      email: `${address}@web3.io`,
      password: '',
      name: 'Người dùng Web3',
      phoneNumber: null,
      address,
      bio: null,
      image: null,
      cover: null,
      isVerified: true,
      isActive: true,
      kycStatus: 'PENDING',
      roleId: 1,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    const mockRole = { id: 1, name: 'USER', description: 'Standard User' };

    beforeEach(() => {
      (verifyMessage as jest.Mock).mockReturnValue(address);
      jest.spyOn(roleService, 'findOneBy').mockResolvedValue(mockRole);
      jest.spyOn(jwtService, 'sign').mockReturnValue('access_token');
      jest
        .spyOn(refreshTokenService, 'createRefreshToken')
        .mockResolvedValue('refresh_token');
    });

    it('should log in existing web3 user', async () => {
      jest.spyOn(usersService, 'findByAddress').mockResolvedValue(mockUser);

      const result = await service.web3Login(address, signature);

      expect(verifyMessage).toHaveBeenCalledWith(message, signature);
      expect(usersService.findByAddress).toHaveBeenCalledWith(address);
      expect(result).toEqual({
        user: mockUser,
        access_token: 'access_token',
        refresh_token: 'refresh_token',
      });
    });

    it('should register new web3 user', async () => {
      jest.spyOn(usersService, 'findByAddress').mockResolvedValue(null);
      jest.spyOn(usersService, 'create').mockResolvedValue(mockUser);

      const result = await service.web3Login(address, signature);

      expect(usersService.create).toHaveBeenCalledWith(
        expect.objectContaining({
          address,
          name: 'Người dùng Web3',
          email: `${address}@web3.io`,
          isVerified: true,
          isActive: true,
          password: '',
          roleId: mockRole.id,
        }),
      );
      expect(result).toEqual({
        user: mockUser,
        access_token: 'access_token',
        refresh_token: 'refresh_token',
      });
    });

    it('should throw UnauthorizedException for invalid signature', async () => {
      (verifyMessage as jest.Mock).mockReturnValue('0xinvalid');

      await expect(service.web3Login(address, signature)).rejects.toThrow(
        new UnauthorizedException('Invalid signature'),
      );
    });
  });

  describe('validateGoogleUser', () => {
    const googleData = {
      email: 'google@example.com',
      name: 'Google User',
      image: 'google_image.jpg',
    };
    const mockUser: User = {
      id: 1,
      email: googleData.email,
      password: '',
      name: googleData.name,
      phoneNumber: null,
      address: `google_${googleData.email.replace('@', '_')}`,
      bio: null,
      image: googleData.image,
      cover: null,
      isVerified: true,
      isActive: true,
      kycStatus: 'PENDING',
      roleId: 1,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    const mockRole = { id: 1, name: 'USER', description: 'Standard User' };

    beforeEach(() => {
      jest.spyOn(prismaService.role, 'findUnique').mockResolvedValue(mockRole);
      jest.spyOn(jwtService, 'sign').mockReturnValue('access_token');
      jest
        .spyOn(refreshTokenService, 'createRefreshToken')
        .mockResolvedValue('refresh_token');
    });

    it('should validate and return tokens for existing Google user', async () => {
      jest
        .spyOn(prismaService.user, 'findUnique')
        .mockResolvedValue({ ...mockUser, role: mockRole } as any);

      const result = await service.validateGoogleUser(googleData);

      expect(prismaService.user.findUnique).toHaveBeenCalledWith({
        where: { email: googleData.email },
        include: { role: true },
      });
      expect(result).toEqual({
        user: { ...mockUser, role: mockRole },
        access_token: 'access_token',
        refresh_token: 'refresh_token',
      });
    });

    it('should create new user and return tokens if Google user does not exist', async () => {
      jest
        .spyOn(prismaService.user, 'findUnique')
        .mockResolvedValue(null as any);
      jest
        .spyOn(prismaService.user, 'create')
        .mockResolvedValue({ ...mockUser, role: mockRole } as any);

      const result = await service.validateGoogleUser(googleData);

      expect(prismaService.user.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          email: googleData.email,
          name: googleData.name,
          image: googleData.image,
          isVerified: true,
          isActive: true,
          password: '',
          address: `google_${googleData.email.replace('@', '_')}`,
          roleId: mockRole.id,
        }),
        include: {
          role: true,
        },
      });
      expect(result).toEqual({
        user: { ...mockUser, role: mockRole },
        access_token: 'access_token',
        refresh_token: 'refresh_token',
      });
    });

    it('should throw InternalServerErrorException if default USER role not found', async () => {
      jest
        .spyOn(prismaService.user, 'findUnique')
        .mockResolvedValue(null as any);
      jest.spyOn(prismaService.role, 'findUnique').mockResolvedValue(null);

      await expect(service.validateGoogleUser(googleData)).rejects.toThrow(
        new InternalServerErrorException('Default role "USER" not found'),
      );
    });

    it('should throw UnauthorizedException if user creation/retrieval fails', async () => {
      jest
        .spyOn(prismaService.user, 'findUnique')
        .mockResolvedValue(null as any);
      jest.spyOn(prismaService.user, 'create').mockResolvedValue(null as any);

      await expect(service.validateGoogleUser(googleData)).rejects.toThrow(
        new UnauthorizedException('Failed to create/retrieve user'),
      );
    });

    it('should throw UnauthorizedException for generic errors', async () => {
      jest
        .spyOn(prismaService.user, 'findUnique')
        .mockRejectedValue(new Error('DB error'));

      await expect(service.validateGoogleUser(googleData)).rejects.toThrow(
        new UnauthorizedException('Google authentication failed'),
      );
    });
  });

  describe('unlinkGoogle', () => {
    const userId = 1;
    const mockUser: User = {
      id: userId,
      email: 'test@gmail.com',
      password: 'hashedPassword',
      name: 'Test User',
      phoneNumber: null,
      address: '123 Main St',
      bio: null,
      image: 'google_image.jpg',
      cover: null,
      isVerified: true,
      isActive: true,
      kycStatus: 'PENDING',
      roleId: 1,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    const mockRole = { id: 1, name: 'USER', description: 'Standard User' };

    beforeEach(() => {
      jest
        .spyOn(prismaService.user, 'findUnique')
        .mockResolvedValue({ ...mockUser, role: mockRole } as any);
    });

    it('should unlink Google account successfully', async () => {
      jest.spyOn(prismaService.user, 'update').mockResolvedValue(mockUser);
      jest
        .spyOn(refreshTokenService, 'revokeAllUserTokens')
        .mockResolvedValue(undefined);

      const result = await service.unlinkGoogle(userId);

      expect(prismaService.user.findUnique).toHaveBeenCalledWith({
        where: { id: userId },
        include: { role: true },
      });
      expect(prismaService.user.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: userId },
          data: expect.objectContaining({
            email: expect.stringContaining('unlinked_'),
            image: null,
            isVerified: false,
          }),
        }),
      );
      expect(refreshTokenService.revokeAllUserTokens).toHaveBeenCalledWith(
        userId,
      );
      expect(result).toEqual({
        message: 'Google account unlinked successfully',
      });
    });

    it('should throw NotFoundException if user not found', async () => {
      jest
        .spyOn(prismaService.user, 'findUnique')
        .mockResolvedValue(null as any);

      await expect(service.unlinkGoogle(userId)).rejects.toThrow(
        new NotFoundException('User not found'),
      );
    });

    it('should throw BadRequestException if account was not created with Google', async () => {
      const nonGoogleUser = { ...mockUser, email: 'regular@example.com' };
      jest
        .spyOn(prismaService.user, 'findUnique')
        .mockResolvedValue({ ...nonGoogleUser, role: mockRole } as any);

      await expect(service.unlinkGoogle(userId)).rejects.toThrow(
        new BadRequestException('This account was not created with Google'),
      );
    });

    it('should throw InternalServerErrorException for generic errors', async () => {
      jest
        .spyOn(prismaService.user, 'findUnique')
        .mockRejectedValue(new Error('DB error'));

      await expect(service.unlinkGoogle(userId)).rejects.toThrow(
        new InternalServerErrorException('Failed to unlink Google account'),
      );
    });
  });

  describe('validateFacebookUser', () => {
    const facebookData = {
      email: 'facebook@example.com',
      name: 'Facebook User',
      image: 'facebook_image.jpg',
      facebookAccessToken: 'token',
    };
    const mockUser: User = {
      id: 1,
      email: facebookData.email,
      password: '',
      name: facebookData.name,
      phoneNumber: null,
      address: `facebook_${facebookData.email.replace('@', '_')}`,
      bio: null,
      image: facebookData.image,
      cover: null,
      isVerified: true,
      isActive: true,
      kycStatus: 'PENDING',
      roleId: 1,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    const mockRole = { id: 1, name: 'USER', description: 'Standard User' };

    beforeEach(() => {
      jest.spyOn(prismaService.role, 'findUnique').mockResolvedValue(mockRole);
      jest.spyOn(jwtService, 'sign').mockReturnValue('access_token');
      jest
        .spyOn(refreshTokenService, 'createRefreshToken')
        .mockResolvedValue('refresh_token');
    });

    it('should validate and return tokens for existing Facebook user', async () => {
      jest
        .spyOn(prismaService.user, 'findUnique')
        .mockResolvedValue({ ...mockUser, role: mockRole } as any);

      const result = await service.validateFacebookUser(facebookData);

      expect(prismaService.user.findUnique).toHaveBeenCalledWith({
        where: { email: facebookData.email },
        include: { role: true },
      });
      expect(result).toEqual({
        user: { ...mockUser, role: mockRole },
        access_token: 'access_token',
        refresh_token: 'refresh_token',
      });
    });

    it('should create new user and return tokens if Facebook user does not exist', async () => {
      jest
        .spyOn(prismaService.user, 'findUnique')
        .mockResolvedValue(null as any);
      jest
        .spyOn(prismaService.user, 'create')
        .mockResolvedValue({ ...mockUser, role: mockRole } as any);

      const result = await service.validateFacebookUser(facebookData);

      expect(prismaService.user.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          email: facebookData.email,
          name: facebookData.name,
          image: facebookData.image,
          isVerified: true,
          isActive: true,
          password: '',
          address: `facebook_${facebookData.email.replace('@', '_')}`,
          roleId: mockRole.id,
        }),
        include: {
          role: true,
        },
      });
      expect(result).toEqual({
        user: { ...mockUser, role: mockRole },
        access_token: 'access_token',
        refresh_token: 'refresh_token',
      });
    });

    it('should throw BadRequestException if image is null', async () => {
      jest
        .spyOn(prismaService.user, 'findUnique')
        .mockResolvedValue({ ...mockUser, image: null } as any)
        .mockResolvedValue({ ...mockUser, image: null } as any);
    });

    it('should throw InternalServerErrorException if default USER role not found', async () => {
      jest
        .spyOn(prismaService.user, 'findUnique')
        .mockResolvedValue(null as any);
      jest.spyOn(prismaService.role, 'findUnique').mockResolvedValue(null);

      await expect(service.validateFacebookUser(facebookData)).rejects.toThrow(
        new InternalServerErrorException('Default role "USER" not found'),
      );
    });

    it('should throw UnauthorizedException if user creation/retrieval fails', async () => {
      jest
        .spyOn(prismaService.user, 'findUnique')
        .mockResolvedValue(null as any);
      jest.spyOn(prismaService.user, 'create').mockResolvedValue(null as any);

      await expect(service.validateFacebookUser(facebookData)).rejects.toThrow(
        new UnauthorizedException('Failed to create/retrieve user'),
      );
    });

    it('should throw UnauthorizedException for generic errors', async () => {
      jest
        .spyOn(prismaService.user, 'findUnique')
        .mockRejectedValue(new Error('DB error'));

      await expect(service.validateFacebookUser(facebookData)).rejects.toThrow(
        new UnauthorizedException('Facebook authentication failed'),
      );
    });
  });
});
