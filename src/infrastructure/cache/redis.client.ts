// src/infrastructure/cache/redis.client.ts
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';  // Changez cette ligne

@Injectable()
export class RedisService {
  private client: Redis;

  constructor(
    private configService: ConfigService
  ) {
    const redisUrl = this.configService.get<string>('REDIS_URL');
    if (!redisUrl) {
      throw new Error('REDIS_URL configuration is required');
    }
    this.client = new Redis(redisUrl);
  }
}