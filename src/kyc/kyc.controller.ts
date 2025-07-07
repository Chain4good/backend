/* eslint-disable @typescript-eslint/no-unsafe-return */
import {
  Controller,
  Post,
  Body,
  UseGuards,
  Get,
  Param,
  Patch,
  BadRequestException,
} from '@nestjs/common';
import { KycService } from './kyc.service';
import {
  UploadKycDocumentDto,
  UpdateKycStatusDto,
  KycStatus,
} from './dto/kyc.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { GetUser, UserExtract } from 'src/auth/decorators/auth.decorators';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';

@Controller('kyc')
export class KycController {
  constructor(private readonly kycService: KycService) {}

  @Post('upload')
  @UseGuards(JwtAuthGuard)
  async uploadKycDocument(
    @GetUser() user: UserExtract,
    @Body() uploadKycDocumentDto: UploadKycDocumentDto,
  ) {
    return this.kycService.uploadKycDocument(user.id, uploadKycDocumentDto);
  }

  @Get('status')
  @UseGuards(JwtAuthGuard)
  async getKycStatus(@GetUser() user: UserExtract) {
    return this.kycService.getKycStatus(user.id);
  }

  @Get('document')
  @UseGuards(JwtAuthGuard)
  async getKycDocument(@GetUser() user: UserExtract) {
    return this.kycService.getKycDocument(user.id);
  }

  // Admin endpoints
  @Get('admin/pending')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  async getPendingKycDocuments() {
    return this.kycService.getAllPendingKycDocuments();
  }

  @Patch('admin/:id/status')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  async updateKycStatus(
    @Param('id') id: string,
    @Body() updateKycStatusDto: UpdateKycStatusDto,
  ) {
    if (updateKycStatusDto.status === KycStatus.APPROVED) {
      return this.kycService.approveKycDocument(+id);
    } else if (updateKycStatusDto.status === KycStatus.REJECTED) {
      if (!updateKycStatusDto.rejectionReason) {
        throw new BadRequestException('Rejection reason is required.');
      }
      return this.kycService.rejectKycDocument(
        +id,
        updateKycStatusDto.rejectionReason,
      );
    }
  }
}
