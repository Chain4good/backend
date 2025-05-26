import { Module } from '@nestjs/common';
import { UploadController } from './upload.controller';
import { UploadService } from './upload.service';
import { CloudinaryProvider } from './cloudinary.provider';
import { mkdir } from 'fs/promises';

@Module({
  controllers: [UploadController],
  providers: [
    UploadService,
    CloudinaryProvider,
    {
      provide: 'UPLOAD_INIT',
      useFactory: async () => {
        try {
          await mkdir('./uploads', { recursive: true });
        } catch (error) {
          // Ignore error if directory already exists
          // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
          if (error.code !== 'EEXIST') {
            throw error;
          }
        }
      },
    },
  ],
})
export class UploadModule {}
