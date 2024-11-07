// src/api/middlewares/rate-limit.middleware.ts
import { Injectable, NestMiddleware, HttpException, HttpStatus } from '@nestjs/common';
import { RedisService } from '../../core/services/cache/redis.service';

@Injectable()
export class RateLimitMiddleware implements NestMiddleware {
  constructor(private readonly redisService: RedisService) {}

  async use(req: any, res: any, next: () => void) {
    const ip = req.ip;
    const path = req.path;
    const key = `ratelimit:${ip}:${path}`;

    const current = await this.redisService.incr(key);
    if (current === 1) {
      await this.redisService.expire(key, 60); // 60 seconds window
    }

    const rateLimit = Reflect.getMetadata('rateLimit', req.route.path);
    if (rateLimit && current > rateLimit.limit) {
      throw new HttpException(
        'Too many requests',
        HttpStatus.TOO_MANY_REQUESTS
      );
    }

    next();
  }
}