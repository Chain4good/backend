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
}
