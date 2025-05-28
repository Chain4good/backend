import { Injectable } from '@nestjs/common';
import { CampaignService } from '../campaign.service';
import { ImageService } from 'src/image/image.service';
import { CreateCampaignDto } from '../dto/create-campaign.dto';

@Injectable()
export class CreateCampaignWithImagesUseCase {
  constructor(
    private readonly campaignService: CampaignService,
    private readonly imageService: ImageService,
  ) {}

  async execute(dto: CreateCampaignDto) {
    // const campaign = await this.campaignService.create(dto);
    // const imageCreatePromises = dto.images.map((url) =>
    //   this.imageService.create({
    //     url,
    //     campaignId: campaign.id,
    //     type: 'IMAGE',
    //   }),
    // );
    // await Promise.all(imageCreatePromises);
    // return campaign;
  }
}
