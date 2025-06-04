import { Injectable } from '@nestjs/common';
import { TopicRepository } from './topic.repository';
import { CreateTopicDto } from './dto/create-topic.dto';
import { UpdateTopicDto } from './dto/update-topic.dto';

@Injectable()
export class TopicService {
  constructor(private readonly topicRepo: TopicRepository) {}

  create(createTopicDto: CreateTopicDto) {
    return this.topicRepo.create(createTopicDto);
  }

  findAll() {
    return this.topicRepo.findAll({
      include: {
        _count: {
          select: {
            posts: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  findOne(id: number) {
    return this.topicRepo.findOne(id, {
      posts: {
        where: {
          published: true,
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              image: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      },
      _count: {
        select: {
          posts: true,
        },
      },
    });
  }

  update(id: number, updateTopicDto: UpdateTopicDto) {
    return this.topicRepo.update(id, updateTopicDto);
  }

  remove(id: number) {
    return this.topicRepo.delete(id);
  }

  async findPopularTopics(limit: number = 5) {
    return this.topicRepo.paginate(1, limit, {
      include: {
        _count: {
          select: {
            posts: true,
          },
        },
      },
      orderBy: {
        posts: {
          _count: 'desc',
        },
      },
    });
  }

  async searchTopics(search: string) {
    return this.topicRepo.findBy({
      OR: [
        {
          name: {
            contains: search,
            mode: 'insensitive',
          },
        },
        {
          description: {
            contains: search,
            mode: 'insensitive',
          },
        },
      ],
    });
  }
}
