// src/core/services/rate-limit/rate-limit.service.ts
import { Injectable } from '@nestjs/common';
import { RedisService } from '../redis.service';

@Injectable()
export class RateLimitService {
  constructor(private readonly redisService: RedisService) {}

  async isRateLimited(key: string, limit: number, window: number): Promise<boolean> {
    const count = await this.redisService.incr(key);
    
    if (count === 1) {
      await this.redisService.expire(key, window);
    }

    return count > limit;
  }
}