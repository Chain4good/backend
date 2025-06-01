import { Injectable } from '@nestjs/common';
import { BaseRepository } from 'src/common/base.repository';
import { Notification, Prisma } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class NotificationRepository extends BaseRepository<
  Notification,
  Prisma.NotificationWhereInput,
  Prisma.NotificationCreateInput,
  Prisma.NotificationUpdateInput,
  Prisma.NotificationOrderByWithRelationInput,
  Prisma.NotificationInclude
> {
  protected readonly modelName = 'Notification' as Prisma.ModelName;
  constructor(protected readonly prisma: PrismaService) {
    super();
  }
}
