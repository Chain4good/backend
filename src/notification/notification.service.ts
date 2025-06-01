import { Injectable } from '@nestjs/common';
import { NotificationRepository } from './notification.repository';
import { NotificationMapper } from './mappers/notification.mapper';
import { NotificationGateway } from './notification.gateway';
import { CreateNotificationDto } from './dto/create-notification.dto';
import {
  NotificationResponse,
  NotificationEntity,
} from './types/notification.types';
import { Prisma } from '@prisma/client';

@Injectable()
export class NotificationService {
  constructor(
    private readonly notificationRepo: NotificationRepository,
    private readonly notificationGateway: NotificationGateway,
  ) {}

  async createAndSendNotification(
    createNotificationDto: CreateNotificationDto,
  ): Promise<NotificationEntity> {
    const notification = await this.notificationRepo.create({
      user: {
        connect: {
          id: createNotificationDto.userId,
        },
      },
      type: createNotificationDto.type,
      content: createNotificationDto.content,
      metadata: createNotificationDto.metadata ?? Prisma.DbNull,
      isRead: false,
    });

    const notificationEntity = NotificationMapper.toEntity(notification);

    this.notificationGateway.sendNotificationToUser(
      createNotificationDto.userId,
      notificationEntity,
    );

    return notificationEntity;
  }

  async getUserNotifications(
    userId: number,
    page: number,
    limit: number,
  ): Promise<NotificationResponse> {
    const result = await this.notificationRepo.paginate(page, limit, {
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });

    return {
      data: NotificationMapper.toEntities(result.data),
      meta: result.meta,
    };
  }
  async markAsRead(id: number): Promise<NotificationEntity> {
    const updatedNotification = await this.notificationRepo.update(id, {
      isRead: true,
    });
    return NotificationMapper.toEntity(updatedNotification);
  }

  async markAllAsRead(userId: number) {
    return this.notificationRepo.updateMany({ userId }, { isRead: true });
  }

  async getUnreadCount(userId: number): Promise<number> {
    return this.notificationRepo.count({
      userId,
      isRead: false,
    });
  }
}
