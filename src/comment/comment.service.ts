import { Injectable, NotFoundException } from '@nestjs/common';
import { FindOneCampaignUseCase } from 'src/campaign/use-cases/find-one-campaign.use-case';
import { NotificationService } from 'src/notification/notification.service';
import { NotificationType } from 'src/notification/types/notification.types';
import { CommentRepo } from './comment.repository';
import { LikeRepo } from './like.repository';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UsersService } from 'src/users/users.service';
import { Campaign, Comment, User } from '@prisma/client';

interface CampaignWithRelations extends Campaign {
  user?: User;
}

@Injectable()
export class CommentService {
  constructor(
    private readonly commentRepo: CommentRepo,
    private readonly likeRepo: LikeRepo,
    private readonly notificationService: NotificationService,
    private readonly findOneCampaignUseCase: FindOneCampaignUseCase,
    private readonly userService: UsersService,
  ) {}

  async create(createCommentDto: CreateCommentDto & { userId: number }) {
    const { userId, campaignId, parentId, ...rest } = createCommentDto;

    if (parentId) {
      const parentComment: Comment | null =
        await this.commentRepo.findOne(parentId);
      if (!parentComment) {
        throw new NotFoundException('Parent comment not found');
      }
    }

    const comment = await this.commentRepo.create({
      ...rest,
      user: { connect: { id: userId } },
      campaign: { connect: { id: campaignId } },
      ...(parentId && { parent: { connect: { id: parentId } } }),
    });

    const campaign: CampaignWithRelations | null =
      (await this.findOneCampaignUseCase.execute(
        campaignId,
      )) as CampaignWithRelations;
    if (!campaign) throw new NotFoundException('Campaign not found');

    if (parentId) {
      const parentComment: Comment | null = await this.commentRepo.findOne(
        parentId,
        {
          user: true,
        },
      );
      if (!parentComment) {
        throw new NotFoundException('Parent comment not found');
      }
      const user: User | null = await this.userService.findById(
        parentComment.userId,
      );
      if (!user) throw new Error('User not found');
      if (parentComment && parentComment.userId !== userId) {
        await this.notificationService.createAndSendNotification({
          userId: parentComment.userId,
          type: NotificationType.COMMENT_REPLY,
          content: `<p><strong>${user.name as string}</strong> đã trả lời bình luận của bạn</p>`,
          metadata: {
            campaignTitle: campaign.title,
            commentId: comment.id,
            campaignId,
            parentCommentId: parentId,
            replierName: comment.userId,
          },
        });
      }
    } else if (campaign.userId !== userId) {
      await this.notificationService.createAndSendNotification({
        userId: campaign.userId,
        type: NotificationType.COMMENT,
        content: 'Có bình luận mới trong chiến dịch của bạn',
        metadata: {
          campaignTitle: campaign.title,
          commentId: comment.id,
          campaignId,
          commenterName: comment.userId,
        },
      });
    }

    return comment;
  }

  async findByCampaign(campaignId: number) {
    return this.commentRepo.findBy(
      { campaignId },
      {
        user: {
          select: {
            id: true,
            name: true,
            image: true,
            UserBadge: {
              select: {
                badge: {
                  select: {
                    id: true,
                    name: true,
                    iconUrl: true,
                  },
                },
              },
            },
          },
        },
        replies: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                image: true,
              },
            },
            Like: {
              select: {
                userId: true,
              },
            },
            _count: {
              select: {
                Like: true,
              },
            },
          },
        },
        Like: {
          select: {
            userId: true,
          },
        },
        _count: {
          select: {
            Like: true,
          },
        },
      },
    );
  }

  async toggleLike(commentId: number, userId: number) {
    const existingLike = await this.likeRepo.findOneBy({
      userId,
      commentId,
    });

    if (existingLike) {
      await this.likeRepo.delete(existingLike.id);
      return { liked: false };
    }

    await this.likeRepo.create({
      user: { connect: { id: userId } },
      comment: { connect: { id: commentId } },
    });

    return { liked: true };
  }
}
