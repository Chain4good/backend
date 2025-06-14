import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Request } from 'express';

import { Role } from '@prisma/client';

export interface UserExtract {
  id: number;
  email: string;
  role?: Role;
}

export const GetUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request: Request = ctx.switchToHttp().getRequest();
    return request.user as UserExtract;
  },
);
