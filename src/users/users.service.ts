import { ConflictException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma, User } from '@prisma/client';
import { UserRegisterDTO } from 'src/auth/dtos/user-register.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async findByEmail(email: string): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: { email },
    });
  }

  async findById(id: number): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: { id },
    });
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
}
