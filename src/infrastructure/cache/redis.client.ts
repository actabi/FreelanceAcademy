// src/infrastructure/cache/redis.client.ts
import { Injectable, OnModuleDestroy, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

@Injectable()
export class RedisService implements OnModuleDestroy {
  private readonly client: Redis;
  private readonly logger = new Logger(RedisService.name);

  constructor(private configService: ConfigService) {
    // Log toutes les variables d'environnement (en masquant les valeurs sensibles)
    this.logger.debug('Available environment variables:', 
      Object.keys(process.env)
        .filter(key => key.includes('REDIS'))
        .map(key => key)
    );

    const redisUrl = process.env.REDIS_URL;
    
    if (!redisUrl) {
      this.logger.error('REDIS_URL is not defined in process.env');
      throw new Error('REDIS_URL configuration is required');
    }

    const maskedUrl = redisUrl.replace(/\/\/.*@/, '//***:***@');
    this.logger.log(`Attempting to connect to Redis with URL: ${maskedUrl}`);
    
    // Tentez d'analyser l'URL
    try {
      const url = new URL(redisUrl);
      this.logger.debug('Redis connection details:', {
        host: url.hostname,
        port: url.port,
        protocol: url.protocol
      });
    } catch (error) {
      this.logger.error('Invalid Redis URL format');
    }

    this.client = new Redis(redisUrl, {
      retryStrategy: (times) => {
        const delay = Math.min(times * 100, 2000);
        this.logger.log(`Retrying Redis connection, attempt ${times}`);
        return delay;
      },
      maxRetriesPerRequest: 5,
      enableReadyCheck: true
    });

    this.client.on('error', (err) => {
      this.logger.error(`Redis Client Error: ${err.message}`);
    });

    this.client.on('connect', () => {
      this.logger.log('Successfully connected to Redis');
    });

    this.client.on('ready', () => {
      this.logger.log('Redis client is ready');
    });
  }

  async onModuleDestroy() {
    await this.client.quit();
  }

  getClient(): Redis {
    return this.client;
  }
}