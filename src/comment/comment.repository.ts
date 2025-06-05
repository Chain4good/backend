import { Injectable } from '@nestjs/common';
import { BaseRepository } from 'src/common/base.repository';
import { Comment, Prisma } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class CommentRepo extends BaseRepository<
  Comment,
  Prisma.CommentWhereInput,
  Prisma.CommentCreateInput,
  Prisma.CommentUpdateInput,
  Prisma.CommentOrderByWithRelationInput,
  Prisma.CommentInclude
> {
  protected readonly modelName = 'Comment' as Prisma.ModelName;
  constructor(protected readonly prisma: PrismaService) {
    super();
  }

  findLike(commentId: number, userId: number) {
    return this.prisma.like.findUnique({
      where: {
        userId_commentId: { userId, commentId },
      },
    });
  }

  deleteLike(commentId: number, userId: number) {
    return this.prisma.like.delete({
      where: {
        userId_commentId: { userId, commentId },
      },
    });
  }

  createLike(commentId: number, userId: number) {
    return this.prisma.like.create({
      data: {
        user: { connect: { id: userId } },
        comment: { connect: { id: commentId } },
      },
    });
  }
}
