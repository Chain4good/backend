import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { DonationService } from './donation.service';
import { CreateDonationDto } from './dto/create-donation.dto';
import { UpdateDonationDto } from './dto/update-donation.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { GetUser, UserExtract } from 'src/auth/decorators/auth.decorators';

@Controller('donations')
export class DonationController {
  constructor(private readonly donationService: DonationService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  create(
    @Body() createDonationDto: CreateDonationDto,
    @GetUser() user: UserExtract,
  ) {
    return this.donationService.create({
      ...createDonationDto,
      userId: user.id,
    });
  }

  @Get()
  findAll() {
    return this.donationService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.donationService.findOne(+id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateDonationDto: UpdateDonationDto,
  ) {
    return this.donationService.update(+id, updateDonationDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.donationService.remove(+id);
  }
}
