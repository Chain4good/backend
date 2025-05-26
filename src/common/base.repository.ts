import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { toCamelCase } from 'src/utils/string';

@Injectable()
export abstract class BaseRepository<
  T,
  TWhereInput,
  TCreateInput,
  TUpdateInput,
  TOrderByInput,
  TInclude,
> {
  protected abstract readonly prisma: PrismaService;
  protected abstract readonly modelName: Prisma.ModelName;

  protected get model() {
    return this.prisma[
      toCamelCase(this.modelName) as keyof PrismaService
    ] as unknown as {
      findMany: (args?: {
        where?: TWhereInput;
        orderBy?: TOrderByInput;
        skip?: number;
        take?: number;
        include?: TInclude;
      }) => Promise<T[]>;
      findUnique: (args: {
        where: { id: number };
        include?: TInclude;
      }) => Promise<T | null>;
      findFirst: (args: {
        where: TWhereInput;
        include?: TInclude;
      }) => Promise<T | null>;
      create: (args: { data: TCreateInput; include?: TInclude }) => Promise<T>;
      update: (args: {
        where: { id: number };
        data: TUpdateInput;
        include?: TInclude;
      }) => Promise<T>;
      delete: (args: { where: { id: number } }) => Promise<T>;
      count: (args?: { where?: TWhereInput }) => Promise<number>;
    };
  }

  async findAll(args?: {
    where?: TWhereInput;
    orderBy?: TOrderByInput;
    include?: TInclude;
  }): Promise<T[]> {
    return this.model.findMany(args);
  }

  async findOne(id: number, include?: TInclude): Promise<T | null> {
    return this.model.findUnique({
      where: { id },
      include,
    });
  }

  async findBy(where: TWhereInput, include?: TInclude): Promise<T[]> {
    return this.model.findMany({
      where,
      include,
    });
  }

  async findOneBy(where: TWhereInput, include?: TInclude): Promise<T | null> {
    return this.model.findFirst({
      where,
      include,
    });
  }

  async create(data: TCreateInput, include?: TInclude): Promise<T> {
    return this.model.create({
      data,
      include,
    });
  }

  async update(id: number, data: TUpdateInput, include?: TInclude): Promise<T> {
    return this.model.update({
      where: { id },
      data,
      include,
    });
  }

  async delete(id: number): Promise<T> {
    return this.model.delete({
      where: { id },
    });
  }

  async count(where?: TWhereInput): Promise<number> {
    return this.model.count({
      where,
    });
  }

  async paginate(
    page: number = 1,
    limit: number = 10,
    options?: {
      where?: TWhereInput;
      orderBy?: TOrderByInput;
      include?: TInclude;
    },
  ): Promise<{
    data: T[];
    meta: {
      total: number;
      page: number;
      limit: number;
    };
  }> {
    const skip = (page - 1) * limit;
    const { where, orderBy, include } = options || {};

    const [data, total] = await Promise.all([
      this.model.findMany({
        where,
        orderBy,
        skip,
        take: limit,
        include,
      }),
      this.model.count({ where }),
    ]);

    return {
      data,
      meta: {
        total,
        page,
        limit,
      },
    };
  }
}
