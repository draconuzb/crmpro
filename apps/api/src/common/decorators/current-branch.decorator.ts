import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const CurrentBranch = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return parseInt(request.headers['x-branch-id'] || '0', 10);
  },
);
