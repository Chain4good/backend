import { Injectable } from '@nestjs/common';
import { PostRepository } from './post.repository';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { Post, Prisma } from '@prisma/client';

@Injectable()
export class PostService {
  constructor(private readonly postRepo: PostRepository) {}

  async create(
    createPostDto: CreatePostDto & { userId: number },
  ): Promise<Post> {
    const { userId, topicId, ...rest } = createPostDto;
    return this.postRepo.create({
      ...rest,
      user: { connect: { id: userId } },
      topic: { connect: { id: topicId } },
      slug: this.createSlug(rest.title),
    });
  }

  async findOneBySlug(slug: string) {
    return this.postRepo.findOneBy(
      {
        slug,
      },
      {
        topic: true,
        user: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
      },
    );
  }

  async findAll(
    page: number = 1,
    limit: number = 10,
    search?: string,
    topicId?: number,
    published: boolean = true,
  ) {
    const where: Prisma.PostWhereInput = {
      published,
      ...(topicId && { topicId: Number(topicId) }),
      ...(search && {
        OR: [
          {
            title: {
              contains: search,
              mode: Prisma.QueryMode.insensitive,
            },
          },
          {
            content: {
              contains: search,
              mode: Prisma.QueryMode.insensitive,
            },
          },
        ],
      }),
    };

    return this.postRepo.paginate(page, limit, {
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        topic: true,
        user: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
      },
    });
  }

  findOne(id: number) {
    return this.postRepo.findOne(id, {
      topic: true,
      user: {
        select: {
          id: true,
          name: true,
          image: true,
        },
      },
    });
  }

  update(id: number, updatePostDto: UpdatePostDto) {
    const { topicId, ...rest } = updatePostDto;
    return this.postRepo.update(
      id,
      {
        ...rest,
        ...(topicId && { topic: { connect: { id: topicId } } }),
      },
      {
        topic: true,
        user: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
      },
    );
  }

  remove(id: number) {
    return this.postRepo.delete(id);
  }

  private createSlug(title: string): string {
    return title
      .toLowerCase()
      .replace(/ /g, '-')
      .replace(/[^\w-]+/g, '')
      .replace(/--+/g, '-');
  }
}
