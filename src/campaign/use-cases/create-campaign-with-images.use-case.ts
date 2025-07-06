import { Injectable } from '@nestjs/common';
import { CampaignService } from '../campaign.service';
import { ImageService } from 'src/image/image.service';

@Injectable()
export class CreateCampaignWithImagesUseCase {
  constructor(
    private readonly campaignService: CampaignService,
    private readonly imageService: ImageService,
  ) {}

  async execute() {
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
