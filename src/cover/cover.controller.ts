import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { CoverService } from './cover.service';
import { CreateCoverDto } from './dto/create-cover.dto';
import { UpdateCoverDto } from './dto/update-cover.dto';

@Controller('covers')
export class CoverController {
  constructor(private readonly coverService: CoverService) {}

  @Post()
  create(@Body() createCoverDto: CreateCoverDto) {
    return this.coverService.create(createCoverDto);
  }

  @Get()
  findAll() {
    return this.coverService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.coverService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateCoverDto: UpdateCoverDto) {
    return this.coverService.update(+id, updateCoverDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.coverService.remove(+id);
  }
}
