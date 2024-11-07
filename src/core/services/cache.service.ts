import { Injectable } from '@nestjs/common';
import { RedisService } from './redis.service';
import { IMission } from '../domain/interfaces/mission.interface';
import { IFreelance } from '../domain/interfaces/freelance.interface';
import { Mission } from '../domain/models/mission.model';


@Injectable()
export class CacheService {
  private readonly MISSION_PREFIX = 'mission:';
  private readonly FREELANCE_PREFIX = 'freelance:';
  private readonly FREELANCE_BY_DISCORD_PREFIX = 'freelance:discord:';
  private readonly DEFAULT_TTL = 3600; // 1 heure en secondes

  constructor(private readonly redisService: RedisService) {}

  // Méthodes pour les missions
  async getMission(id: string): Promise<IMission | null> {
    const cached = await this.redisService.get(`${this.MISSION_PREFIX}${id}`);
    return cached ? JSON.parse(cached) : null;
  }

  async setMission(id: string, mission: IMission): Promise<void> {
    await this.redisService.set(
      `${this.MISSION_PREFIX}${id}`,
      JSON.stringify(mission),
      this.DEFAULT_TTL
    );
  }

  async invalidateMission(id: string): Promise<void> {
    await this.redisService.del(`${this.MISSION_PREFIX}${id}`);
  }

  // Méthodes pour les freelances
  async getFreelance(id: string): Promise<IFreelance | null> {
    const cached = await this.redisService.get(`${this.FREELANCE_PREFIX}${id}`);
    return cached ? JSON.parse(cached) : null;
  }

  async setFreelance(id: string, freelance: IFreelance): Promise<void> {
    await this.redisService.set(
      `${this.FREELANCE_PREFIX}${id}`,
      JSON.stringify(freelance),
      this.DEFAULT_TTL
    );

    // Cache secondaire par Discord ID pour les recherches rapides
    if (freelance.discordId) {
      await this.redisService.set(
        `${this.FREELANCE_BY_DISCORD_PREFIX}${freelance.discordId}`,
        JSON.stringify(freelance),
        this.DEFAULT_TTL
      );
    }
  }

  async getFreelanceByDiscordId(discordId: string): Promise<IFreelance | null> {
    const cached = await this.redisService.get(`${this.FREELANCE_BY_DISCORD_PREFIX}${discordId}`);
    return cached ? JSON.parse(cached) : null;
  }

  async invalidateFreelance(id: string, discordId?: string): Promise<void> {
    await this.redisService.del(`${this.FREELANCE_PREFIX}${id}`);
    if (discordId) {
      await this.redisService.del(`${this.FREELANCE_BY_DISCORD_PREFIX}${discordId}`);
    }
  }

  // Méthodes pour le rate limiting
  async incrementRateLimit(key: string, ttlSeconds: number): Promise<number> {
    const count = await this.redisService.incr(key);
    if (count === 1) {
      await this.redisService.expire(key, ttlSeconds);
    }
    return count;
  }

  // Méthodes pour les sessions utilisateur
  async setUserSession(userId: string, sessionData: any, ttlSeconds: number = 86400): Promise<void> {
    await this.redisService.set(
      `session:${userId}`,
      JSON.stringify(sessionData),
      ttlSeconds
    );
  }

  async getUserSession(userId: string): Promise<any | null> {
    const session = await this.redisService.get(`session:${userId}`);
    return session ? JSON.parse(session) : null;
  }

  // Méthodes utilitaires
  async clearCache(pattern: string): Promise<void> {
    const keys = await this.redisService.getClient().keys(pattern);
    if (keys.length > 0) {
      await this.redisService.getClient().del(...keys);
    }
  }

  // Méthodes pour le cache des résultats de matching
  async cacheMatchingResults(missionId: string, freelanceIds: string[]): Promise<void> {
    await this.redisService.set(
      `matching:${missionId}`,
      JSON.stringify(freelanceIds),
      1800 // 30 minutes
    );
  }

  async getMatchingResults(missionId: string): Promise<string[] | null> {
    const cached = await this.redisService.get(`matching:${missionId}`);
    return cached ? JSON.parse(cached) : null;
  }
}