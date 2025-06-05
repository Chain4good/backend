import { Injectable } from '@nestjs/common';
import { CreateReportDto } from './dto/create-report.dto';
import { UpdateReportDto } from './dto/update-report.dto';
import { ReportRepository } from './report.repository';

@Injectable()
export class ReportService {
  constructor(private readonly reportRepository: ReportRepository) {}
  create(createReportDto: CreateReportDto) {
    return this.reportRepository.create({
      content: createReportDto.content,
      type: createReportDto.type,
      campaign: { connect: { id: createReportDto.campaignId } },
    });
  }

  findAll(page: number, limit: number) {
    return this.reportRepository.paginate(page, limit, {});
  }

  findOne(id: number) {
    return this.reportRepository.findOne(id);
  }

  update(id: number, updateReportDto: UpdateReportDto) {
    return this.reportRepository.update(id, updateReportDto);
  }

  remove(id: number) {
    return this.reportRepository.delete(id);
  }
}
