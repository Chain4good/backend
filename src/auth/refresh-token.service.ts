import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class RefreshTokenService {
  constructor(private prisma: PrismaService) {}

  async createRefreshToken(userId: number): Promise<string> {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call
    const token = uuidv4();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // Token expires in 7 days

    await this.prisma.refreshToken.create({
      data: {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        token,
        userId,
        expiresAt,
      },
    });

    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return token;
  }

  async validateRefreshToken(token: string) {
    const refreshToken = await this.prisma.refreshToken.findUnique({
      where: { token },
      include: { user: true },
    });

    if (!refreshToken) return null;
    if (new Date() > refreshToken.expiresAt) {
      await this.prisma.refreshToken.delete({ where: { id: refreshToken.id } });
      return null;
    }

    return refreshToken.user;
  }

  async deleteRefreshToken(token: string) {
    await this.prisma.refreshToken.delete({ where: { token } });
  }
}
