import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  ForbiddenException,
} from '@nestjs/common';
import { Observable } from 'rxjs';

@Injectable()
export class BranchScopeInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    // Skip for unauthenticated requests (login, health, etc.)
    if (!user) {
      request.branchId = null;
      return next.handle();
    }

    const branchIdHeader = request.headers['x-branch-id'];

    if (branchIdHeader) {
      const branchId = parseInt(branchIdHeader, 10);

      if (isNaN(branchId)) {
        throw new ForbiddenException('Invalid branch ID');
      }

      if (user.role === 'CEO') {
        request.branchId = branchId;
      } else {
        const userBranches: number[] = user.branchIds || [];
        if (!userBranches.includes(branchId)) {
          throw new ForbiddenException('You do not have access to this branch');
        }
        request.branchId = branchId;
      }
    } else {
      if (user.role === 'CEO') {
        request.branchId = null;
      } else {
        // Non-CEO without branch header — use first assigned branch
        const userBranches: number[] = user.branchIds || [];
        request.branchId = userBranches[0] || null;
      }
    }

    return next.handle();
  }
}
