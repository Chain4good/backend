import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { CampaignModule } from './campaign/campaign.module';
import { CountryModule } from './country/country.module';
import { FundraiseTypeModule } from './fundraise-type/fundraise-type.module';
import { CoverModule } from './cover/cover.module';
import { ImageModule } from './image/image.module';
import { UploadModule } from './upload/upload.module';
import { CategoryModule } from './category/category.module';
import { MailerModule } from './mailer/mailer.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    PrismaModule,
    UsersModule,
    AuthModule,
    CampaignModule,
    FundraiseTypeModule,
    CoverModule,
    ImageModule,
    UploadModule,
    CategoryModule,
    CountryModule,
    MailerModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
