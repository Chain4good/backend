import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { OTPService } from '../otp/otp.service';
import { ConfigService } from '@nestjs/config';
import {
  UnauthorizedException,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { UserRegisterDTO } from './dtos/user-register.dto';
import { VerifyOTPDto } from './dtos/verify-otp.dto';
import { Request, Response } from 'express';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: jest.Mocked<AuthService>;
  let otpService: jest.Mocked<OTPService>;
  let configService: jest.Mocked<ConfigService>;
  let mockResponse: Partial<Response>;
  let mockRequest: Partial<Request>;

  const mockUser = {
    id: 1,
    email: 'test@example.com',
    name: 'Test User',
    address: '123 Test St',
    password: 'hashedPassword',
    phoneNumber: null,
    bio: null,
    image: null,
    cover: null,
    isVerified: true,
    isActive: true,
    kycStatus: 'PENDING' as const,
    roleId: 1,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockLoginTokens = {
    user: { id: 1, email: 'test@example.com', role: 'USER' },
    access_token: 'mock_access_token',
    refresh_token: 'mock_refresh_token',
  };

  const mockWeb3Tokens = {
    user: { ...mockUser, password: 'hashedPassword' },
    access_token: 'mock_access_token',
    refresh_token: 'mock_refresh_token',
  };

  beforeEach(async () => {
    const mockAuthService = {
      login: jest.fn(),
      web3Login: jest.fn(),
      refreshAccessToken: jest.fn(),
      logout: jest.fn(),
      register: jest.fn(),
      verifyEmailAndCreateUser: jest.fn(),
      getMe: jest.fn(),
      unlinkGoogle: jest.fn(),
    };

    const mockOTPService = {
      generateOTP: jest.fn(),
    };

    const mockConfigService = {
      get: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
        {
          provide: OTPService,
          useValue: mockOTPService,
        },
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    authService = module.get(AuthService);
    otpService = module.get(OTPService);
    configService = module.get(ConfigService);

    // Mock Response object
    mockResponse = {
      cookie: jest.fn(),
      clearCookie: jest.fn(),
      redirect: jest.fn(),
    };

    // Mock Request object
    mockRequest = {
      cookies: {},
      user: {},
    };

    // Setup environment
    process.env.NODE_ENV = 'test';
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('login', () => {
    it('should login user and set cookies', async () => {
      authService.login.mockResolvedValue(mockLoginTokens);

      const userReq = { email: 'test@example.com', id: 1 };
      const result = await controller.login(userReq, mockResponse as Response);

      expect(authService.login).toHaveBeenCalledWith(userReq);
      expect(mockResponse.cookie).toHaveBeenCalledTimes(2);
      expect(mockResponse.cookie).toHaveBeenCalledWith(
        'access_token',
        'mock_access_token',
        expect.any(Object),
      );
      expect(mockResponse.cookie).toHaveBeenCalledWith(
        'refresh_token',
        'mock_refresh_token',
        expect.any(Object),
      );
      expect(result).toEqual(mockLoginTokens.user);
    });

    it('should throw error when login fails', async () => {
      const error = new Error('Login failed');
      authService.login.mockRejectedValue(error);

      const userReq = { email: 'test@example.com', id: 1 };

      await expect(
        controller.login(userReq, mockResponse as Response),
      ).rejects.toThrow(error);
    });
  });

  describe('web3Login', () => {
    it('should login with web3 and set cookies', async () => {
      authService.web3Login.mockResolvedValue(mockWeb3Tokens);

      const web3Data = { address: '0x123...', signature: 'signature123' };
      const result = await controller.web3Login(
        web3Data,
        mockResponse as Response,
      );

      expect(authService.web3Login).toHaveBeenCalledWith(
        web3Data.address,
        web3Data.signature,
      );
      expect(mockResponse.cookie).toHaveBeenCalledTimes(2);
      expect(result).toEqual(mockUser);
    });

    it('should throw error when web3 login fails', async () => {
      const error = new Error('Web3 login failed');
      authService.web3Login.mockRejectedValue(error);

      const web3Data = { address: '0x123...', signature: 'invalid' };

      await expect(
        controller.web3Login(web3Data, mockResponse as Response),
      ).rejects.toThrow(error);
    });
  });

  describe('refresh', () => {
    it('should refresh token successfully', async () => {
      mockRequest.cookies = { refresh_token: 'valid_refresh_token' };
      authService.refreshAccessToken.mockResolvedValue({
        access_token: 'new_access_token',
      });

      const result = await controller.refresh(
        mockRequest as Request,
        mockResponse as Response,
      );

      expect(authService.refreshAccessToken).toHaveBeenCalledWith(
        'valid_refresh_token',
      );
      expect(mockResponse.cookie).toHaveBeenCalledWith(
        'access_token',
        'new_access_token',
        expect.any(Object),
      );
      expect(result).toEqual({ message: 'Token refreshed successfully' });
    });

    it('should throw UnauthorizedException when refresh token not found', async () => {
      mockRequest.cookies = {};

      await expect(
        controller.refresh(mockRequest as Request, mockResponse as Response),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should throw error when refresh fails', async () => {
      mockRequest.cookies = { refresh_token: 'invalid_token' };
      const error = new Error('Token refresh failed');
      authService.refreshAccessToken.mockRejectedValue(error);

      await expect(
        controller.refresh(mockRequest as Request, mockResponse as Response),
      ).rejects.toThrow(error);
    });
  });

  describe('logout', () => {
    it('should logout successfully with refresh token', async () => {
      mockRequest.cookies = { refresh_token: 'valid_refresh_token' };
      authService.logout.mockResolvedValue(undefined);

      const result = await controller.logout(
        mockRequest as Request,
        mockResponse as Response,
      );

      expect(authService.logout).toHaveBeenCalledWith('valid_refresh_token');
      expect(mockResponse.clearCookie).toHaveBeenCalledWith('access_token');
      expect(mockResponse.clearCookie).toHaveBeenCalledWith('refresh_token');
      expect(result).toEqual({ message: 'Logged out successfully' });
    });

    it('should logout successfully without refresh token', async () => {
      mockRequest.cookies = {};

      const result = await controller.logout(
        mockRequest as Request,
        mockResponse as Response,
      );

      expect(authService.logout).not.toHaveBeenCalled();
      expect(mockResponse.clearCookie).toHaveBeenCalledWith('access_token');
      expect(mockResponse.clearCookie).toHaveBeenCalledWith('refresh_token');
      expect(result).toEqual({ message: 'Logged out successfully' });
    });
  });

  describe('register', () => {
    it('should register user successfully', async () => {
      const userRegisterDto: UserRegisterDTO = {
        email: 'test@example.com',
        password: 'password123',
        name: 'Test User',
        address: '123 Test St',
      };

      const expectedResult = {
        message: 'OTP sent to your email',
        data: { ...userRegisterDto, password: 'hashedPassword' },
      };
      authService.register.mockResolvedValue(expectedResult);

      const result = await controller.register(userRegisterDto);

      expect(authService.register).toHaveBeenCalledWith(userRegisterDto);
      expect(result).toEqual(expectedResult);
    });

    it('should throw error when registration fails', async () => {
      const userRegisterDto: UserRegisterDTO = {
        email: 'test@example.com',
        password: 'password123',
        name: 'Test User',
        address: '123 Test St',
      };

      const error = new Error('Registration failed');
      authService.register.mockRejectedValue(error);

      await expect(controller.register(userRegisterDto)).rejects.toThrow(error);
    });
  });

  describe('verifyEmail', () => {
    it('should verify email successfully', async () => {
      const verifyOTPDto: VerifyOTPDto = {
        email: 'test@example.com',
        code: '123456',
      };

      const userData: UserRegisterDTO = {
        email: 'test@example.com',
        password: 'password123',
        name: 'Test User',
        address: '123 Test St',
      };

      authService.verifyEmailAndCreateUser.mockResolvedValue(mockUser);

      const result = await controller.verifyEmail(verifyOTPDto, userData);

      expect(authService.verifyEmailAndCreateUser).toHaveBeenCalledWith(
        verifyOTPDto,
        userData,
      );
      expect(result).toEqual(mockUser);
    });

    it('should throw error when email verification fails', async () => {
      const verifyOTPDto: VerifyOTPDto = {
        email: 'test@example.com',
        code: 'invalid',
      };

      const userData: UserRegisterDTO = {
        email: 'test@example.com',
        password: 'password123',
        name: 'Test User',
        address: '123 Test St',
      };

      const error = new Error('Invalid OTP');
      authService.verifyEmailAndCreateUser.mockRejectedValue(error);

      await expect(
        controller.verifyEmail(verifyOTPDto, userData),
      ).rejects.toThrow(error);
    });
  });

  describe('resendOTP', () => {
    it('should resend OTP successfully', async () => {
      const email = 'test@example.com';
      otpService.generateOTP.mockResolvedValue('123456');

      const result = await controller.resendOTP(email);

      expect(otpService.generateOTP).toHaveBeenCalledWith(email);
      expect(result).toEqual({ message: 'OTP resent successfully' });
    });

    it('should throw error when OTP generation fails', async () => {
      const email = 'test@example.com';
      const error = new Error('OTP generation failed');
      otpService.generateOTP.mockRejectedValue(error);

      await expect(controller.resendOTP(email)).rejects.toThrow(error);
    });
  });

  describe('getProfile', () => {
    it('should get user profile successfully', async () => {
      const user = { id: 1, email: 'test@example.com' };
      authService.getMe.mockResolvedValue(mockUser);

      const result = await controller.getProfile(user);

      expect(authService.getMe).toHaveBeenCalledWith(user.id);
      expect(result).toEqual(mockUser);
    });

    it('should throw error when profile retrieval fails', async () => {
      const user = { id: 1, email: 'test@example.com' };
      const error = new Error('Profile not found');
      authService.getMe.mockRejectedValue(error);

      await expect(controller.getProfile(user)).rejects.toThrow(error);
    });
  });

  describe('googleAuth', () => {
    it('should initiate Google auth', async () => {
      // This method just initiates the auth flow, no return value
      const result = await controller.googleAuth();
      expect(result).toBeUndefined();
    });
  });

  describe('googleAuthRedirect', () => {
    it('should handle Google auth redirect successfully', async () => {
      configService.get.mockReturnValue('http://localhost:3000');
      mockRequest.user = mockLoginTokens;

      await controller.googleAuthRedirect(
        mockRequest as Request,
        mockResponse as Response,
      );

      expect(mockResponse.cookie).toHaveBeenCalledTimes(2);
      expect(mockResponse.redirect).toHaveBeenCalledWith(
        'http://localhost:3000',
      );
    });

    it('should redirect to error page when Google auth fails', async () => {
      configService.get.mockReturnValue('http://localhost:3000');
      mockRequest.user = undefined; // Simulate auth failure

      await controller.googleAuthRedirect(
        mockRequest as Request,
        mockResponse as Response,
      );

      expect(mockResponse.redirect).toHaveBeenCalledWith(
        'http://localhost:3000/login?error=google_auth_failed',
      );
    });
  });

  describe('unlinkGoogle', () => {
    it('should unlink Google account successfully', async () => {
      const user = { id: 1 };
      authService.unlinkGoogle.mockResolvedValue({
        message: 'Google account unlinked successfully',
      });

      const result = await controller.unlinkGoogle(
        user,
        mockResponse as Response,
      );

      expect(authService.unlinkGoogle).toHaveBeenCalledWith(user.id);
      expect(mockResponse.clearCookie).toHaveBeenCalledTimes(2);
      expect(result).toEqual({
        message: 'Google account unlinked successfully',
      });
    });

    it('should throw HttpException when unlink fails', async () => {
      const user = { id: 1 };
      const error = {
        message: 'Unlink failed',
        status: HttpStatus.BAD_REQUEST,
      };
      authService.unlinkGoogle.mockRejectedValue(error);

      await expect(
        controller.unlinkGoogle(user, mockResponse as Response),
      ).rejects.toThrow(HttpException);
    });

    it('should throw HttpException with default status when error has no status', async () => {
      const user = { id: 1 };
      const error = new Error('Unlink failed');
      authService.unlinkGoogle.mockRejectedValue(error);

      await expect(
        controller.unlinkGoogle(user, mockResponse as Response),
      ).rejects.toThrow(HttpException);
    });
  });

  describe('facebookAuth', () => {
    it('should initiate Facebook auth', async () => {
      const result = await controller.facebookAuth();
      expect(result).toBeUndefined();
    });
  });

  describe('facebookAuthRedirect', () => {
    it('should handle Facebook auth redirect successfully', async () => {
      configService.get.mockReturnValue('http://localhost:3000');
      mockRequest.user = mockLoginTokens;

      await controller.facebookAuthRedirect(
        mockRequest as Request,
        mockResponse as Response,
      );

      expect(mockResponse.cookie).toHaveBeenCalledTimes(2);
      expect(mockResponse.redirect).toHaveBeenCalledWith(
        'http://localhost:3000',
      );
    });

    it('should redirect to error page when Facebook auth fails', async () => {
      configService.get.mockReturnValue('http://localhost:3000');
      mockRequest.user = undefined;

      await controller.facebookAuthRedirect(
        mockRequest as Request,
        mockResponse as Response,
      );

      expect(mockResponse.redirect).toHaveBeenCalledWith(
        'http://localhost:3000/login?error=facebook_auth_failed',
      );
    });
  });

  describe('Cookie Configuration', () => {
    it('should set cookies with correct configuration in production', async () => {
      process.env.NODE_ENV = 'production';
      authService.login.mockResolvedValue(mockLoginTokens);

      const userReq = { email: 'test@example.com', id: 1 };
      await controller.login(userReq, mockResponse as Response);

      expect(mockResponse.cookie).toHaveBeenCalledWith(
        'access_token',
        'mock_access_token',
        {
          httpOnly: true,
          secure: true, // Should be true in production
          sameSite: 'lax',
          path: '/',
          maxAge: 1 * 60 * 60 * 1000,
        },
      );
    });

    it('should set cookies with correct configuration in development', async () => {
      process.env.NODE_ENV = 'development';
      authService.login.mockResolvedValue(mockLoginTokens);

      const userReq = { email: 'test@example.com', id: 1 };
      await controller.login(userReq, mockResponse as Response);

      expect(mockResponse.cookie).toHaveBeenCalledWith(
        'access_token',
        'mock_access_token',
        {
          httpOnly: true,
          secure: false, // Should be false in development
          sameSite: 'lax',
          path: '/',
          maxAge: 1 * 60 * 60 * 1000,
        },
      );
    });
  });
});
