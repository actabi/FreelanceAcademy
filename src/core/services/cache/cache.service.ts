// src/core/services/cache/cache.service.ts
import { Injectable } from '@nestjs/common';
import { RedisService } from './redis.service';
import { IMission } from '../../domain/models/mission.model';

@Injectable()
export class CacheService {
  private readonly DEFAULT_TTL = 3600; // 1 heure

  constructor(private readonly redisService: RedisService) {}

  private getKey(type: string, id: string): string {
    return `${type}:${id}`;
  }

  async getMission(id: string): Promise<IMission | null> {
    const key = this.getKey('mission', id);
    const cached = await this.redisService.get(key);
    return cached ? JSON.parse(cached) : null;
  }

  async setMission(mission: IMission): Promise<void> {
    const key = this.getKey('mission', mission.id);
    await this.redisService.set(
      key,
      JSON.stringify(mission),
      this.DEFAULT_TTL
    );
  }

  async invalidateMission(id: string): Promise<void> {
    const key = this.getKey('mission', id);
    await this.redisService.del(key);
  }
}