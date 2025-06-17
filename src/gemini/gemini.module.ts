import { Module } from '@nestjs/common';
import { GeminiService } from './gemini.service';
import { ConfigModule } from '@nestjs/config';
import { UploadModule } from '../upload/upload.module';
import { PrismaModule } from '../prisma/prisma.module';
import { UploadService } from 'src/upload/upload.service';

@Module({
  imports: [ConfigModule, UploadModule, PrismaModule],
  providers: [GeminiService, UploadService],
  exports: [GeminiService],
})
export class GeminiModule {}
