import { Test, TestingModule } from '@nestjs/testing';
import { MailerService } from './mailer.service';
import { MailerService as NestMailerService } from '@nestjs-modules/mailer';

describe('MailerService', () => {
  let service: MailerService;
  let nestMailerService: NestMailerService;

  beforeEach(async () => {
    const mockNestMailerService = {
      sendMail: jest.fn().mockResolvedValue(true),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MailerService,
        {
          provide: NestMailerService,
          useValue: mockNestMailerService,
        },
      ],
    }).compile();

    service = module.get<MailerService>(MailerService);
    nestMailerService = module.get<NestMailerService>(NestMailerService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('sendCampaignCreated', () => {
    it('should send campaign created email', async () => {
      const email = 'creator@example.com';
      const campaignName = 'Test Campaign';
      const campaignId = 1;

      await service.sendCampaignCreated(email, campaignName, campaignId);

      expect(nestMailerService.sendMail).toHaveBeenCalledWith({
        to: email,
        subject: 'Chiến dịch tạo ra thành công',
        template: 'campaign-created',
        context: {
          campaignName,
          campaignId,
        },
      });
    });
  });

  describe('sendMail', () => {
    it('should send generic email', async () => {
      const email = 'test@example.com';
      const subject = 'Test Subject';
      const template = 'test-template';
      const context = { name: 'Test User' };

      await service.sendMail(email, subject, template, context);

      expect(nestMailerService.sendMail).toHaveBeenCalledWith({
        to: email,
        subject: subject,
        template: template,
        context,
      });
    });
  });

  describe('sendDonationConfirmation', () => {
    it('should send donation confirmation email', async () => {
      const email = 'donor@example.com';
      const data = {
        campaignName: 'Help Animals',
        amount: 100,
        donorName: 'John Doe',
      };

      await service.sendDonationConfirmation(email, data);

      expect(nestMailerService.sendMail).toHaveBeenCalledWith({
        to: email,
        subject: 'Thank You for Your Donation',
        template: 'donation-confirmation',
        context: data,
      });
    });
  });

  describe('sendCampaignStatusUpdate', () => {
    it('should send campaign status update email', async () => {
      const email = 'creator@example.com';
      const data = {
        campaignName: 'Test Campaign',
        status: 'APPROVED',
      };

      await service.sendCampaignStatusUpdate(email, data);

      expect(nestMailerService.sendMail).toHaveBeenCalledWith({
        to: email,
        subject: 'Campaign Status Updated',
        template: 'campaign-status-update',
        context: data,
      });
    });
  });

  describe('sendCustomThankYouEmail', () => {
    it('should send custom thank you email', async () => {
      const email = 'donor@example.com';
      const subject = 'Thank You!';
      const content = '<h1>Thank you for your donation!</h1>';

      await service.sendCustomThankYouEmail(email, subject, content);

      expect(nestMailerService.sendMail).toHaveBeenCalledWith({
        to: email,
        subject,
        html: content,
      });
    });
  });

  describe('sendToAdminCampaignCreated', () => {
    it('should send admin notification for new campaign', async () => {
      const email = 'admin@example.com';
      const campaignName = 'New Campaign';

      await service.sendToAdminCampaignCreated(email, campaignName);

      expect(nestMailerService.sendMail).toHaveBeenCalledWith({
        to: email,
        subject: 'Chiến dịch mới được tạo',
        template: 'campaign-created-admin',
        context: {
          campaignName,
        },
      });
    });
  });
});
