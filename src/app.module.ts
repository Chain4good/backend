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
import { DonationModule } from './donation/donation.module';
import { CommentModule } from './comment/comment.module';
import { AiModule } from './ai/ai.module';
import { NotificationModule } from './notification/notification.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { TopicModule } from './topic/topic.module';
import { PostModule } from './post/post.module';
import { GeminiModule } from './gemini/gemini.module';
import { ReportModule } from './report/report.module';
import { RoleModule } from './role/role.module';
import { KycModule } from './kyc/kyc.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true, // Makes config available globally
      envFilePath: '.env',
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
    DonationModule,
    CommentModule,
    AiModule,
    NotificationModule,
    DashboardModule,
    TopicModule,
    PostModule,
    GeminiModule,
    ReportModule,
    RoleModule,
    KycModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
