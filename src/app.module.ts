// src/app.module.ts
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DiscoveryModule } from '@nestjs/core'; // Ajout de cet import
import { MissionEntity } from './core/domain/entities/mission.entity';
import { FreelanceEntity } from './core/domain/entities/freelance.entity';
import { SkillEntity } from './core/domain/entities/skill.entity';
import { ApplicationEntity } from './core/domain/entities/application.entity';
import { AlertEntity } from './core/domain/entities/alert.entity';
import { DiscordClient } from './bot/discord.client';
import { MissionService } from './core/services/mission.service';
import { FreelanceService } from './core/services/freelance.service';
import { MatchingService } from './core/services/matching.service';
import { CacheService } from './core/services/cache.service';
import { AlertService } from './core/services/alert.service';
import { BotModule } from './bot/bot.module';
import { NotificationModule } from './core/notification/notification.module';
import { RedisModule } from './core/redis/redis.module';
import { HealthController } from './api/controllers/health.controller';
import { AuthController } from './api/controllers/auth.controller';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      ignoreEnvFile: process.env.NODE_ENV === 'production',
      load: [() => ({
        isDevelopment: process.env.NODE_ENV === 'development',
        isProduction: process.env.NODE_ENV === 'production',
      })],
    }),
    DiscoveryModule, // Ajout de ce module
    RedisModule,
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        url: process.env.DATABASE_URL + "?family=0",
        entities: [MissionEntity],
        synchronize: configService.get('isDevelopment'),
        ssl: process.env.NODE_ENV === 'production' ? {
          rejectUnauthorized: false,
        } : false,
        retryAttempts: 5,
        retryDelay: 3000,
        keepConnectionAlive: true,
        autoLoadEntities: true, // Ajout de cette option
        logging: configService.get('isDevelopment'),
        ...(configService.get('isDevelopment') && {
          maxQueryExecutionTime: 1000,
          debug: true,
        }),
      }),
      inject: [ConfigService],
    }),
    TypeOrmModule.forFeature([
      MissionEntity,
      FreelanceEntity,
      SkillEntity,
      ApplicationEntity,
      AlertEntity
    ]),
    NotificationModule,
    BotModule,
  ],
  controllers: [
    HealthController,
    AuthController
  ],
  providers: [
    {
      provide: 'IDiscordService',
      useClass: DiscordClient,
    },
    {
      provide: 'DISCORD_COMMANDS', // Ajout de ce provider
      useValue: []
    },
    MissionService,
    FreelanceService,
    MatchingService,
    AlertService,
    CacheService
  ],
  exports: [
    MissionService,
    FreelanceService,
    MatchingService
  ],
})
export class AppModule {}