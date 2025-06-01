import {
  IsNotEmpty,
  IsNumber,
  IsString,
  IsEnum,
  IsObject,
  IsOptional,
} from 'class-validator';
import { NotificationType } from '../types/notification.types';

export class CreateNotificationDto {
  @IsNumber()
  @IsNotEmpty()
  userId: number;

  @IsEnum(NotificationType)
  @IsNotEmpty()
  type: NotificationType;

  @IsString()
  @IsNotEmpty()
  content: string;

  @IsObject()
  @IsOptional()
  metadata?: Record<string, any>;
}
