import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { MailerService } from '../mailer/mailer.service';

@Injectable()
export class OTPService {
  constructor(
    private prisma: PrismaService,
    private mailerService: MailerService,
  ) {}

  async generateOTP(email: string): Promise<string> {
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 15);

    await this.prisma.oTP.upsert({
      where: { email },
      update: {
        code,
        expiresAt,
        verified: false,
      },
      create: {
        email,
        code,
        expiresAt,
      },
    });
    await this.mailerService.sendMail(
      email,
      'Xác thực email của bạn',
      'verify-email',
      {
        code,
        logoUrl: 'http://chain4good.io.vn/logo.png',
        supportUrl: 'http://chain4good.io.vn/support',
        privacyUrl: 'http://chain4good.io.vn/privacy',
        termsUrl: 'http://chain4good.io.vn/terms',
        currentYear: new Date().getFullYear(),
      },
    );
    return code;
  }

  async verifyOTP(email: string, code: string): Promise<boolean> {
    const otp = await this.prisma.oTP.findUniqueOrThrow({
      where: { email },
    });

    if (!otp) return false;
    if (otp.verified) return false;
    if (otp.code !== code) return false;
    if (otp.expiresAt < new Date()) return false;

    await this.prisma.oTP.update({
      where: { email },
      data: { verified: true },
    });

    return true;
  }
}
