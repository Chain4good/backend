export class CampaignCreatedEvent {
  constructor(
    public readonly campaignTitle: string,
    public readonly userEmail: string,
    public readonly campaignId: number,
  ) {}
}

export class CampaignCreatedSuccessEvent {
  constructor(
    public readonly campaignTitle: string,
    public readonly userEmail: string,
    public readonly campaignId: number,
  ) {}
}
