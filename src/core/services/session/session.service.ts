// src/core/services/session/session.service.ts
import { Injectable } from '@nestjs/common';
import { RedisService } from '../redis.service';
import { randomUUID } from 'crypto';

@Injectable()
export class SessionService {
  constructor(private readonly redisService: RedisService) {}

  async createSession(userId: string, data: any): Promise<string> {
    const sessionId = randomUUID();
    const key = `session:${sessionId}`;
    
    await this.redisService.set(
      key,
      JSON.stringify({ userId, ...data }),
      24 * 3600 // 24 heures
    );

    return sessionId;
  }

  async getSession(sessionId: string): Promise<any | null> {
    const key = `session:${sessionId}`;
    const data = await this.redisService.get(key);
    return data ? JSON.parse(data) : null;
  }
}