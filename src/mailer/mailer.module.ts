import { Module } from '@nestjs/common';
import { MailerModule as NestMailerModule } from '@nestjs-modules/mailer';
import { mailerConfig } from '../config/mailer.config';
import { MailerService } from './mailer.service';

@Module({
  imports: [NestMailerModule.forRoot(mailerConfig)],
  providers: [MailerService],
  exports: [MailerService],
})
export class MailerModule {}
