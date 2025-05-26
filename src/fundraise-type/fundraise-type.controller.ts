import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
} from '@nestjs/common';
import { FundraiseTypeService } from './fundraise-type.service';
import { CreateFundraiseTypeDto } from './dto/create-fundraise-type.dto';
import { UpdateFundraiseTypeDto } from './dto/update-fundraise-type.dto';

@Controller('fundraise-types')
export class FundraiseTypeController {
  constructor(private readonly fundraiseTypeService: FundraiseTypeService) {}

  @Post()
  create(@Body() createFundraiseTypeDto: CreateFundraiseTypeDto) {
    return this.fundraiseTypeService.create(createFundraiseTypeDto);
  }

  @Get()
  findAll() {
    return this.fundraiseTypeService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.fundraiseTypeService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateFundraiseTypeDto: UpdateFundraiseTypeDto,
  ) {
    return this.fundraiseTypeService.update(id, updateFundraiseTypeDto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.fundraiseTypeService.remove(id);
  }
}
