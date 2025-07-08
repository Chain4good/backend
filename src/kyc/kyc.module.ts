import { Module } from '@nestjs/common';
import { KycService } from './kyc.service';
import { KycController } from './kyc.controller';
import { PrismaModule } from 'src/prisma/prisma.module';
import { UploadModule } from 'src/upload/upload.module';
import { NotificationModule } from 'src/notification/notification.module';
import { UsersModule } from 'src/users/users.module';
import { KycRepository } from './kyc.repository';

@Module({
  imports: [PrismaModule, UploadModule, NotificationModule, UsersModule],
  providers: [KycService, KycRepository],
  controllers: [KycController],
  exports: [KycService],
})
export class KycModule {}
