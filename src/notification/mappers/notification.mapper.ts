import { Notification } from '@prisma/client';
import {
  NotificationEntity,
  NotificationMetadata,
  NotificationType,
} from '../types/notification.types';

export class NotificationMapper {
  static toEntity(notification: Notification): NotificationEntity {
    return {
      id: notification.id,
      type: notification.type as NotificationType,
      content: notification.content,
      metadata: notification.metadata as NotificationMetadata | null,
      isRead: notification.isRead,
      createdAt: notification.createdAt,
      userId: notification.userId,
    };
  }

  static toEntities(notifications: Notification[]): NotificationEntity[] {
    // eslint-disable-next-line @typescript-eslint/unbound-method
    return notifications.map(this.toEntity);
  }
}
