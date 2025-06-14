import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { PrismaModule } from '../prisma/prisma.module';
import { UserController } from './users.controller';
import { UserRepository } from './user.repository';
import { PrismaService } from 'src/prisma/prisma.service';

@Module({
  controllers: [UserController],
  imports: [PrismaModule],
  providers: [UsersService, UserRepository, PrismaService],
  exports: [UsersService],
})
export class UsersModule {}
