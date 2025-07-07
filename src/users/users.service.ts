import { ConflictException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma, User } from '@prisma/client';
import { UserRegisterDTO } from 'src/auth/dtos/user-register.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserRepository } from './user.repository';
import { KycStatus } from 'src/kyc/dto/kyc.dto';

@Injectable()
export class UsersService {
  constructor(
    private prisma: PrismaService,
    private readonly userRepository: UserRepository,
  ) {}

  async findByEmail(email: string): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: { email },
      include: {
        role: true, // Include role information if needed
      },
    });
  }

  async findById(id: number): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: { id },
      include: {
        role: true, // Include role information if needed
        UserBadge: {
          include: {
            badge: true, // Include badge information if needed
          },
        },
      },
    });
  }
  async findByAddress(address: string) {
    return this.prisma.user.findFirst({ where: { address } });
  }

  async create(userRegisterDto: UserRegisterDTO): Promise<User> {
    const { email, password, name, address } = userRegisterDto;
    try {
      return await this.prisma.user.create({
        data: {
          email,
          password,
          name,
          address,
          roleId: 2,
        },
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new ConflictException(
            // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
            `Unique constraint failed on the fields: (${error?.meta?.target})`,
          );
        }
      }
      throw error;
    }
  }
  async update(id: number, data: UpdateUserDto) {
    return this.prisma.user.update({
      where: { id },
      data,
    });
  }

  async updateKycStatus(userId: number, status: KycStatus): Promise<User> {
    return this.prisma.user.update({
      where: { id: userId },
      data: { kycStatus: status },
    });
  }

  async findAllByRole(roleId: number) {
    return this.prisma.user.findMany({
      where: { roleId },
    });
  }

  async findAll(
    page: number,
    limit: number,
    name: string,
    email: string,
    role: string,
  ) {
    return this.userRepository.paginate(page, limit, {
      where: {
        ...(name && { name: { contains: name, mode: 'insensitive' } }),
        ...(email && { email: { contains: email, mode: 'insensitive' } }),
        ...(role && { roleId: Number(role) }),
      },
    });
  }

  async remove(id: number) {
    return this.prisma.user.update({
      where: { id },
      data: { isActive: false },
    });
  }
}
