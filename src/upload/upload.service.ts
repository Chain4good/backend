/* eslint-disable @typescript-eslint/prefer-promise-reject-errors */
import { Injectable, OnModuleInit } from '@nestjs/common';
import { v2 as cloudinary } from 'cloudinary';
import { createReadStream } from 'fs';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class UploadService implements OnModuleInit {
  constructor(private configService: ConfigService) {}

  onModuleInit() {
    const cloudName: string | undefined = this.configService.get(
      'CLOUDINARY_CLOUD_NAME',
    );
    const apiKey: string | undefined =
      this.configService.get('CLOUDINARY_API_KEY');
    const apiSecret: string | undefined = this.configService.get(
      'CLOUDINARY_API_SECRET',
    );

    console.log(cloudName, apiKey, apiSecret);

    if (!cloudName || !apiKey || !apiSecret) {
      throw new Error('Missing required Cloudinary configuration');
    }

    cloudinary.config({
      cloud_name: cloudName,
      api_key: apiKey,
      api_secret: apiSecret,
    });
  }

  async uploadImage(file: Express.Multer.File) {
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: 'charity',
          resource_type: 'auto',
        },
        (error, result) => {
          if (error) return reject(error);
          resolve(result);
        },
      );
      createReadStream(file.path).pipe(uploadStream);
    });
  }
}
