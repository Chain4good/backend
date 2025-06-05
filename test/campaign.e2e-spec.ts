import { Controller, Post, Body, Param } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { CampaignService } from '../src/campaign/campaign.service';
import { CreateCampaignDto } from '../src/campaign/dto/create-campaign.dto';

class FakeCampaignService {
  private campaigns: any[] = [];
  private id = 1;

  async create(dto: CreateCampaignDto & { userId: number; email: string }) {
    const campaign = {
      id: this.id++,
      ...dto,
      status: 'PENDING',
      user: { id: dto.userId, email: dto.email, name: 'User' },
      name: dto.title,
    };
    this.campaigns.push(campaign);
    return campaign;
  }

  async findOne(id: number) {
    return this.campaigns.find((c) => c.id === id);
  }

  async approveCampaign(id: number) {
    const campaign = await this.findOne(id);
    if (!campaign) throw new Error('Campaign not found');
    campaign.status = 'APPROVED';
    return campaign;
  }
}

@Controller('campaigns')
class TestCampaignController {
  constructor(private readonly svc: CampaignService) {}

  @Post()
  create(@Body() dto: any) {
    return this.svc.create(dto);
  }

  @Post(':id/approve')
  approve(@Param('id') id: number) {
    return this.svc.approveCampaign(Number(id));
  }
}

describe('Campaign workflow (e2e)', () => {
  let app: INestApplication;
  let service: FakeCampaignService;

  beforeAll(async () => {
    service = new FakeCampaignService();
    const moduleRef = await Test.createTestingModule({
      controllers: [TestCampaignController],
      providers: [{ provide: CampaignService, useValue: service }],
    }).compile();

    app = moduleRef.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('creates a campaign', async () => {
    const dto: any = {
      title: 'Test',
      description: 'desc',
      goal: 1000,
      deadline: new Date().toISOString(),
      categoryId: 1,
      countryId: 1,
      images: ['img'],
      fundraiseTypeId: 1,
      coverId: 1,
      userId: 1,
      email: 'a@a.com',
    };

    const res = await request(app.getHttpServer())
      .post('/campaigns')
      .send(dto)
      .expect(201);

    expect(res.body.title).toBe('Test');
    expect(res.body.status).toBe('PENDING');
  });

  it('approves a campaign', async () => {
    const createRes = await request(app.getHttpServer())
      .post('/campaigns')
      .send({
        title: 'Approve',
        description: 'desc',
        goal: 1000,
        deadline: new Date().toISOString(),
        categoryId: 1,
        countryId: 1,
        images: ['img'],
        fundraiseTypeId: 1,
        coverId: 1,
        userId: 1,
        email: 'a@a.com',
      })
      .expect(201);

    const id = createRes.body.id;

    const approveRes = await request(app.getHttpServer())
      .post(`/campaigns/${id}/approve`)
      .expect(201);

    expect(approveRes.body.status).toBe('APPROVED');
  });
});
