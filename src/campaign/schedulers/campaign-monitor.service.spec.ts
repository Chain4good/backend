import { Test, TestingModule } from '@nestjs/testing';
import { CampaignMonitorService } from './campaign-monitor.service';
import { PrismaService } from '../../prisma/prisma.service';
import { CampaignEmailService } from '../../email/campaign-email.service';
import { CampaignStatus } from '@prisma/client';

describe('CampaignMonitorService', () => {
  let service: CampaignMonitorService;
  let prisma: { campaign: { findMany: jest.Mock; update: jest.Mock } };
  let email: {
    sendDeadlineReminderEmail: jest.Mock;
    sendCampaignCompletedEmail: jest.Mock;
  };

  beforeEach(async () => {
    prisma = {
      campaign: {
        findMany: jest.fn(),
        update: jest.fn(),
      },
    } as any;

    email = {
      sendDeadlineReminderEmail: jest.fn(),
      sendCampaignCompletedEmail: jest.fn(),
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CampaignMonitorService,
        { provide: PrismaService, useValue: prisma },
        { provide: CampaignEmailService, useValue: email },
      ],
    }).compile();

    service = module.get<CampaignMonitorService>(CampaignMonitorService);
  });

  it('marks campaign finished when deadline passed', async () => {
    prisma.campaign.findMany.mockResolvedValue([
      {
        id: 1,
        title: 'Test',
        goal: 100,
        totalDonated: 10,
        deadline: new Date(Date.now() - 1000),
        user: { email: 'a@test.com' },
      },
    ]);

    await service.handleCampaignChecks();

    expect(prisma.campaign.update).toHaveBeenCalledWith({
      where: { id: 1 },
      data: { status: CampaignStatus.FINISHED, isClosed: true },
    });
    expect(email.sendCampaignCompletedEmail).toHaveBeenCalledWith(
      'a@test.com',
      'Test',
    );
  });

  it('sends reminder when deadline approaching', async () => {
    prisma.campaign.findMany.mockResolvedValue([
      {
        id: 2,
        title: 'Test2',
        goal: 100,
        totalDonated: 10,
        deadline: new Date(Date.now() + 6 * 60 * 60 * 1000),
        user: { email: 'b@test.com' },
      },
    ]);

    await service.handleCampaignChecks();

    expect(email.sendDeadlineReminderEmail).toHaveBeenCalledWith(
      'b@test.com',
      'Test2',
      expect.any(Number),
    );
  });
});
