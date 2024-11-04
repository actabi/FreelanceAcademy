// src/api/controllers/health.controller.ts
import { Controller, Get } from '@nestjs/common';
import { InjectConnection } from '@nestjs/typeorm';
import { Connection } from 'typeorm';
import { RedisService } from '@infrastructure/cache/redis.client';

@Controller('health')
export class HealthController {
  constructor(
    @InjectConnection() private connection: Connection,
    private redisService: RedisService,
  ) {}

  @Get()
  async check() {
    const dbHealth = await this.checkDatabase();
    const redisHealth = await this.checkRedis();

    return {
      status: dbHealth && redisHealth ? 'ok' : 'error',
      database: dbHealth,
      redis: redisHealth,
      timestamp: new Date().toISOString(),
    };
  }

  private async checkDatabase(): Promise<boolean> {
    try {
      await this.connection.query('SELECT 1');
      return true;
    } catch (error) {
      console.error('Database health check failed:', error);
      return false;
    }
  }

  private async checkRedis(): Promise<boolean> {
    try {
      const client = this.redisService.getClient();
      await client.ping();
      return true;
    } catch (error) {
      console.error('Redis health check failed:', error);
      return false;
    }
  }
}