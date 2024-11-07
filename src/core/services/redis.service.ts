import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
  private client: Redis;

  constructor(private configService: ConfigService) {
    this.client = new Redis({
      host: this.configService.get<string>('REDIS_HOST', 'localhost'),
      port: this.configService.get<number>('REDIS_PORT', 6379),
      password: this.configService.get<string>('REDIS_PASSWORD'),
      retryStrategy: (times: number) => {
        // Stratégie de reconnexion
        // Réessayer toutes les 2 secondes pendant la première minute
        if (times <= 30) {
          return 2000;
        }
        // Ensuite, abandonner
        return null;
      }
    });

    // Gestion des erreurs
    this.client.on('error', (err) => {
      console.error('Redis Client Error:', err);
    });
  }

  async onModuleInit() {
    try {
      await this.client.ping();
      console.log('Redis connection established');
    } catch (e) {
      console.error('Failed to connect to Redis:', e);
      throw e;
    }
  }

  async onModuleDestroy() {
    await this.client.quit();
  }

  getClient(): Redis {
    return this.client;
  }

  // Méthodes utilitaires pour le cache
  async set(key: string, value: string, ttlSeconds?: number): Promise<void> {
    if (ttlSeconds) {
      await this.client.set(key, value, 'EX', ttlSeconds);
    } else {
      await this.client.set(key, value);
    }
  }

  async get(key: string): Promise<string | null> {
    return await this.client.get(key);
  }

  async del(key: string): Promise<void> {
    await this.client.del(key);
  }

  async incr(key: string): Promise<number> {
    return await this.client.incr(key);
  }

  async expire(key: string, seconds: number): Promise<void> {
    await this.client.expire(key, seconds);
  }

  // Méthodes pour les hash maps
  async hset(key: string, field: string, value: string): Promise<void> {
    await this.client.hset(key, field, value);
  }

  async hget(key: string, field: string): Promise<string | null> {
    return await this.client.hget(key, field);
  }

  async hdel(key: string, field: string): Promise<void> {
    await this.client.hdel(key, field);
  }

  // Méthodes pour les listes
  async lpush(key: string, values: string[]): Promise<void> {
    await this.client.lpush(key, ...values);
  }

  async rpop(key: string): Promise<string | null> {
    return await this.client.rpop(key);
  }

  // Méthodes pour les sets
  async sadd(key: string, members: string[]): Promise<void> {
    await this.client.sadd(key, ...members);
  }

  async sismember(key: string, member: string): Promise<boolean> {
    const result = await this.client.sismember(key, member);
    return result === 1;
  }
}