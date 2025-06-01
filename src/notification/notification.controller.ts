import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { GetUser, UserExtract } from '../auth/decorators/auth.decorators';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { NotificationService } from './notification.service';
import {
  NotificationEntity,
  NotificationResponse,
} from './types/notification.types';
import { CreateNotificationDto } from './dto/create-notification.dto';

@Controller('notifications')
@UseGuards(JwtAuthGuard)
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}
  @Post('')
  create(@Body() createNotificationDto: CreateNotificationDto) {
    return this.notificationService.createAndSendNotification(
      createNotificationDto,
    );
  }
  @Get()
  async getUserNotifications(
    @GetUser() user: UserExtract,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
  ): Promise<NotificationResponse> {
    return this.notificationService.getUserNotifications(user.id, page, limit);
  }

  @Patch(':id/read')
  async markAsRead(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<NotificationEntity> {
    return this.notificationService.markAsRead(id);
  }

  @Patch('mark-all-read')
  async markAllAsRead(@GetUser() user: UserExtract) {
    return this.notificationService.markAllAsRead(user.id);
  }

  @Get('unread-count')
  async getUnreadCount(@GetUser() user: UserExtract) {
    return this.notificationService.getUnreadCount(user.id);
  }
}
