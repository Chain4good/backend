import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { UserRepository } from './user.repository';
import { User, Prisma } from '@prisma/client';
import { ConflictException } from '@nestjs/common';
import { KycStatus } from 'src/kyc/dto/kyc.dto';

describe('UsersService', () => {
  let service: UsersService;
  let prismaService: PrismaService;
  let userRepository: UserRepository;
  let mockUser: User;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: PrismaService,
          useValue: {
            user: {
              findUnique: jest.fn(),
              findFirst: jest.fn(),
              create: jest.fn(),
              update: jest.fn(),
              findMany: jest.fn(),
            },
          },
        },
        {
          provide: UserRepository,
          useValue: {
            paginate: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    prismaService = module.get<PrismaService>(PrismaService);
    userRepository = module.get<UserRepository>(UserRepository);

    mockUser = {
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
      kycStatus: KycStatus.PENDING,
      roleId: 1,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findByEmail', () => {
    it('should return a user by email', async () => {
      jest.spyOn(prismaService.user, 'findUnique').mockResolvedValue(mockUser);
      const result = await service.findByEmail(mockUser.email);
      expect(result).toEqual(mockUser);
      expect(prismaService.user.findUnique).toHaveBeenCalledWith({
        where: { email: mockUser.email },
        include: { role: true },
      });
    });

    it('should return null if user not found by email', async () => {
      jest.spyOn(prismaService.user, 'findUnique').mockResolvedValue(null);
      const result = await service.findByEmail('nonexistent@example.com');
      expect(result).toBeNull();
    });
  });

  describe('findById', () => {
    it('should return a user by ID', async () => {
      jest.spyOn(prismaService.user, 'findUnique').mockResolvedValue(mockUser);
      const result = await service.findById(mockUser.id);
      expect(result).toEqual(mockUser);
      expect(prismaService.user.findUnique).toHaveBeenCalledWith({
        where: { id: mockUser.id },
        include: {
          role: true,
          UserBadge: {
            include: {
              badge: true,
            },
          },
        },
      });
    });

    it('should return null if user not found by ID', async () => {
      jest.spyOn(prismaService.user, 'findUnique').mockResolvedValue(null);
      const result = await service.findById(999);
      expect(result).toBeNull();
    });
  });

  describe('findByAddress', () => {
    it('should return a user by address', async () => {
      jest.spyOn(prismaService.user, 'findFirst').mockResolvedValue(mockUser);
      const result = await service.findByAddress(mockUser.address);
      expect(result).toEqual(mockUser);
      expect(prismaService.user.findFirst).toHaveBeenCalledWith({
        where: { address: mockUser.address },
      });
    });

    it('should return null if user not found by address', async () => {
      jest.spyOn(prismaService.user, 'findFirst').mockResolvedValue(null);
      const result = await service.findByAddress('nonexistent_address');
      expect(result).toBeNull();
    });
  });

  describe('create', () => {
    const userRegisterDto = {
      email: 'new@example.com',
      password: 'newPassword',
      name: 'New User',
      address: 'New Address',
    };

    it('should create a new user', async () => {
      const createdUser = { ...mockUser, email: userRegisterDto.email };
      jest.spyOn(prismaService.user, 'create').mockResolvedValue(createdUser);
      const result = await service.create(userRegisterDto);
      expect(result).toEqual(createdUser);
      expect(prismaService.user.create).toHaveBeenCalledWith({
        data: {
          email: userRegisterDto.email,
          password: userRegisterDto.password,
          name: userRegisterDto.name,
          address: userRegisterDto.address,
          roleId: 2,
        },
      });
    });

    it('should throw ConflictException if email already exists (P2002)', async () => {
      const error = new Prisma.PrismaClientKnownRequestError(
        'Unique constraint failed',
        {
          code: 'P2002',
          clientVersion: '2.0.0',
          meta: { target: ['email'] },
        },
      );
      jest.spyOn(prismaService.user, 'create').mockRejectedValue(error);

      await expect(service.create(userRegisterDto)).rejects.toThrow(
        new ConflictException(
          'Unique constraint failed on the fields: (email)',
        ),
      );
    });

    it('should rethrow other Prisma errors', async () => {
      const error = new Prisma.PrismaClientKnownRequestError(
        'Some other error',
        {
          code: 'PXXX',
          clientVersion: '2.0.0',
        },
      );
      jest.spyOn(prismaService.user, 'create').mockRejectedValue(error);

      await expect(service.create(userRegisterDto)).rejects.toThrow(error);
    });

    it('should rethrow non-Prisma errors', async () => {
      const error = new Error('Generic error');
      jest.spyOn(prismaService.user, 'create').mockRejectedValue(error);

      await expect(service.create(userRegisterDto)).rejects.toThrow(error);
    });
  });

  describe('update', () => {
    it('should update a user', async () => {
      const updatedData = { name: 'Updated Name' };
      const updatedUser = { ...mockUser, ...updatedData };
      jest.spyOn(prismaService.user, 'update').mockResolvedValue(updatedUser);
      const result = await service.update(mockUser.id, updatedData);
      expect(result).toEqual(updatedUser);
      expect(prismaService.user.update).toHaveBeenCalledWith({
        where: { id: mockUser.id },
        data: updatedData,
      });
    });
  });

  describe('updateKycStatus', () => {
    it("should update a user's KYC status", async () => {
      const newStatus = KycStatus.APPROVED;
      const updatedUser = { ...mockUser, kycStatus: newStatus };
      jest.spyOn(prismaService.user, 'update').mockResolvedValue(updatedUser);
      const result = await service.updateKycStatus(mockUser.id, newStatus);
      expect(result).toEqual(updatedUser);
      expect(prismaService.user.update).toHaveBeenCalledWith({
        where: { id: mockUser.id },
        data: { kycStatus: newStatus },
      });
    });
  });

  describe('findAllByRole', () => {
    it('should return all users by role ID', async () => {
      const roleId = 1;
      const usersByRole = [{ ...mockUser, roleId }];
      jest.spyOn(prismaService.user, 'findMany').mockResolvedValue(usersByRole);
      const result = await service.findAllByRole(roleId);
      expect(result).toEqual(usersByRole);
      expect(prismaService.user.findMany).toHaveBeenCalledWith({
        where: { roleId },
      });
    });
  });

  describe('findAll', () => {
    const page = 1;
    const limit = 10;
    const name = 'Test';
    const email = 'test';
    const role = '1';
    const paginatedResult = {
      data: [mockUser],
      meta: { total: 1, page, limit },
    };

    it('should paginate users with filters', async () => {
      jest.spyOn(userRepository, 'paginate').mockResolvedValue(paginatedResult);

      const result = await service.findAll(page, limit, name, email, role);
      expect(result).toEqual(paginatedResult);
      expect(userRepository.paginate).toHaveBeenCalledWith(page, limit, {
        where: {
          name: { contains: name, mode: 'insensitive' },
          email: { contains: email, mode: 'insensitive' },
          roleId: Number(role),
        },
      });
    });

    it('should paginate users without filters', async () => {
      jest.spyOn(userRepository, 'paginate').mockResolvedValue(paginatedResult);

      const result = await service.findAll(page, limit, '', '', '');
      expect(result).toEqual(paginatedResult);
      expect(userRepository.paginate).toHaveBeenCalledWith(page, limit, {
        where: {},
      });
    });
  });

  describe('remove', () => {
    it('should deactivate a user', async () => {
      const deactivatedUser = { ...mockUser, isActive: false };
      jest
        .spyOn(prismaService.user, 'update')
        .mockResolvedValue(deactivatedUser);
      const result = await service.remove(mockUser.id);
      expect(result).toEqual(deactivatedUser);
      expect(prismaService.user.update).toHaveBeenCalledWith({
        where: { id: mockUser.id },
        data: { isActive: false },
      });
    });
  });
});
