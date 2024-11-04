// src/app.module.ts
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { databaseConfig } from './config/database.config';
import { HealthController } from './api/controllers/health.controller';
import { RedisService } from './infrastructure/cache/redis.client';

@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true
        }),
        TypeOrmModule.forRoot(databaseConfig)
    ],
    controllers: [HealthController],
    providers: [RedisService]
})
export class AppModule {}