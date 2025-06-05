import 'tsconfig-paths/register';
import { Test } from '@nestjs/testing';
import { CommentService } from './comment.service';
import { CommentRepo } from './comment.repository';
import { NotificationService } from '../notification/notification.service';
import { CampaignService } from '../campaign/campaign.service';
import { UsersService } from '../users/users.service';

describe('CommentService.toggleLike', () => {
  let service: CommentService;
  let findLike: jest.Mock;
  let deleteLike: jest.Mock;
  let createLike: jest.Mock;

  beforeEach(async () => {
    findLike = jest.fn();
    deleteLike = jest.fn();
    createLike = jest.fn();

    const moduleRef = await Test.createTestingModule({
      providers: [
        CommentService,
        {
          provide: CommentRepo,
          useValue: {
            findLike,
            deleteLike,
            createLike,
          },
        },
        { provide: NotificationService, useValue: {} },
        { provide: CampaignService, useValue: {} },
        { provide: UsersService, useValue: {} },
      ],
    }).compile();

    service = moduleRef.get(CommentService);
  });

  it('should remove like when already liked', async () => {
    findLike.mockResolvedValue({ id: 1 });

    const result = await service.toggleLike(1, 2);

    expect(deleteLike).toHaveBeenCalledWith(1, 2);
    expect(result).toEqual({ liked: false });
  });

  it('should create like when not liked', async () => {
    findLike.mockResolvedValue(null);

    const result = await service.toggleLike(3, 4);

    expect(createLike).toHaveBeenCalledWith(3, 4);
    expect(result).toEqual({ liked: true });
  });
});
