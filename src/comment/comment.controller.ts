import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  UseGuards,
} from '@nestjs/common';
import { CommentService } from './comment.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { GetUser } from '../auth/decorators/auth.decorators';

@Controller('comments')
export class CommentController {
  constructor(private readonly commentService: CommentService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  create(
    @Body() createCommentDto: CreateCommentDto,
    @GetUser() user: { id: number },
  ) {
    return this.commentService.create({
      ...createCommentDto,
      userId: user.id,
    });
  }

  @Get('campaign/:campaignId')
  findByCampaign(@Param('campaignId', ParseIntPipe) campaignId: number) {
    return this.commentService.findByCampaign(campaignId);
  }

  @UseGuards(JwtAuthGuard)
  @Post(':id/like')
  async toggleLike(
    @Param('id', ParseIntPipe) id: number,
    @GetUser() user: { id: number },
  ) {
    return await this.commentService.toggleLike(id, user.id);
  }
}
