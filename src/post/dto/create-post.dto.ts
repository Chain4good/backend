// filepath: src/post/dto/create-post.dto.ts
import { IsNotEmpty, IsString, IsOptional, IsBoolean } from 'class-validator';

export class CreatePostDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  content: string;

  @IsString()
  @IsOptional()
  thumbnail?: string;

  @IsNotEmpty()
  topicId: number;

  @IsBoolean()
  @IsOptional()
  published?: boolean;
}
