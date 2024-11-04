// src/api/controllers/health.controller.ts
import { Controller, Get } from '@nestjs/common';
import { InjectConnection } from '@nestjs/typeorm';
import { Connection } from 'typeorm';
import { RedisService } from '../../infrastructure/cache/redis.client';

@Controller('health')
export class HealthController {
    constructor(
        @InjectConnection() private connection: Connection,
        private redisService: RedisService
    ) {}

    @Get()
    async check() {
        // Vérifier la connexion à la base de données
        const dbStatus = await this.checkDatabase();
        
        // Vérifier la connexion à Redis
        const redisStatus = await this.checkRedis();

        return {
            status: 'ok',
            timestamp: new Date().toISOString(),
            environment: process.env.NODE_ENV,
            checks: {
                database: dbStatus,
                redis: redisStatus
            }
        };
    }

    private async checkDatabase(): Promise<boolean> {
        try {
            await this.connection.query('SELECT 1');
            return true;
        } catch (error) {
            console.error('Database check failed:', error);
            return false;
        }
    }

    private async checkRedis(): Promise<boolean> {
        try {
            await this.redisService.set('health-check', 'ok');
            const result = await this.redisService.get('health-check');
            return result === 'ok';
        } catch (error) {
            console.error('Redis check failed:', error);
            return false;
        }
    }
}