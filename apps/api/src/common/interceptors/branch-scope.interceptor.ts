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
    const branchIdHeader = request.headers['x-branch-id'];

    if (branchIdHeader) {
      request.branchId = parseInt(branchIdHeader, 10);
    } else {
      const userRole = request.user?.role;

      if (userRole === 'CEO') {
        // CEO can operate without a branch scope
        request.branchId = null;
      } else {
        throw new ForbiddenException(
          'x-branch-id header is required for non-CEO users',
        );
      }
    }

    return next.handle();
  }
}
