import { Injectable, NotFoundException } from '@nestjs/common';
import { CampaignService } from 'src/campaign/campaign.service';
import { NotificationService } from 'src/notification/notification.service';
import { NotificationType } from 'src/notification/types/notification.types';
import { CommentRepo } from './comment.repository';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UsersService } from 'src/users/users.service';

@Injectable()
export class CommentService {
  constructor(
    private readonly commentRepo: CommentRepo,
    private readonly notificationService: NotificationService,
    private readonly campaignService: CampaignService,
    private readonly userService: UsersService,
  ) {}

  async create(createCommentDto: CreateCommentDto & { userId: number }) {
    const { userId, campaignId, parentId, ...rest } = createCommentDto;

    if (parentId) {
      const parentComment = await this.commentRepo.findOne(parentId);
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

    const campaign = await this.campaignService.findOne(campaignId);
    if (!campaign) throw new Error('Campaign not found');

    if (parentId) {
      const parentComment = await this.commentRepo.findOne(parentId, {
        user: true,
      });
      if (!parentComment) {
        throw new NotFoundException('Parent comment not found');
      }
      const user = await this.userService.findById(parentComment?.userId);
      if (!user) throw new Error('User not found');
      if (parentComment && parentComment.userId !== userId) {
        await this.notificationService.createAndSendNotification({
          userId: parentComment.userId,
          type: NotificationType.COMMENT_REPLY,
          content: `<p><strong>${user.name}</strong> đã trả lời bình luận của bạn</p>`,
          metadata: {
            campaignTitle: campaign.title,
            commentId: comment.id,
            campaignId,
            parentCommentId: parentId,
            replierName: comment.userId,
          },
        });
      }
    } else {
      if (campaign.userId !== userId) {
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
    const existingLike = await this.commentRepo.findLike(commentId, userId);

    if (existingLike) {
      await this.commentRepo.deleteLike(commentId, userId);
      return { liked: false };
    }

    await this.commentRepo.createLike(commentId, userId);
    return { liked: true };
  }
}
