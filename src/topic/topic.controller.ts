import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { CreateTopicDto } from './dto/create-topic.dto';
import { TopicService } from './topic.service';
import { UpdateTopicDto } from './dto/update-topic.dto';

@Controller('topics')
export class TopicController {
  constructor(private readonly topicService: TopicService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  create(@Body() createTopicDto: CreateTopicDto) {
    return this.topicService.create(createTopicDto);
  }

  @Get()
  findAll() {
    return this.topicService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.topicService.findOne(+id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  update(@Param('id') id: string, @Body() updateTopicDto: UpdateTopicDto) {
    return this.topicService.update(+id, updateTopicDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  remove(@Param('id') id: string) {
    return this.topicService.remove(+id);
  }
}
