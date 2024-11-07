// src/api/decorators/rate-limit.decorator.ts
import { SetMetadata } from '@nestjs/common';

export const RateLimit = (limit: number, duration: number) =>
  SetMetadata('rateLimit', { limit, duration });

// src/api/guards/auth.guard.ts
import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Observable } from 'rxjs';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private readonly jwtService: JwtService) {}

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const request = context.switchToHttp().getRequest();
    try {
      const token = request.headers.authorization?.split(' ')[1];
      const decoded = this.jwtService.verify(token);
      request.user = decoded;
      return true;
    } catch {
      return false;
    }
  }
}