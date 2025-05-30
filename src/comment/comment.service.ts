import { Injectable, NotFoundException } from '@nestjs/common';
import { CommentRepo } from './comment.repository';
import { CreateCommentDto } from './dto/create-comment.dto';

@Injectable()
export class CommentService {
  constructor(private readonly commentRepo: CommentRepo) {}

  async create(createCommentDto: CreateCommentDto & { userId: number }) {
    const { userId, campaignId, parentId, ...rest } = createCommentDto;

    if (parentId) {
      const parentComment = await this.commentRepo.findOne(parentId);
      if (!parentComment) {
        throw new NotFoundException('Parent comment not found');
      }
    }

    return this.commentRepo.create({
      ...rest,
      user: { connect: { id: userId } },
      campaign: { connect: { id: campaignId } },
      ...(parentId && { parent: { connect: { id: parentId } } }),
    });
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
    // const existingLike = await this.commentRepo.prisma.like.findUnique({
    //   where: {
    //     userId_commentId: {
    //       userId,
    //       commentId,
    //     },
    //   },
    // });
    // if (existingLike) {
    //   // Unlike
    //   await this.commentRepo.prisma.like.delete({
    //     where: {
    //       userId_commentId: {
    //         userId,
    //         commentId,
    //       },
    //     },
    //   });
    //   return { liked: false };
    // } else {
    //   // Like
    //   await this.commentRepo.prisma.like.create({
    //     data: {
    //       user: { connect: { id: userId } },
    //       comment: { connect: { id: commentId } },
    //     },
    //   });
    //   return { liked: true };
    // }
  }
}
