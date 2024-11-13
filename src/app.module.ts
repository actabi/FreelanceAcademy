// src/app.module.ts

import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
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

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      ignoreEnvFile: false,
      cache: true,
      load: [
        () => ({
          discord: {
            token: process.env.DISCORD_TOKEN,
            clientId: process.env.DISCORD_CLIENT_ID,
            channelId: process.env.DISCORD_CHANNEL_ID,
            guildId: process.env.DISCORD_GUILD_ID,
            enable: process.env.ENABLE_DISCORD !== 'false',
          },
          database: {
            url: process.env.DATABASE_URL,
          },
          redis: {
            url: process.env.REDIS_URL,
          },
        }),
      ],
    }),
    RedisModule,
    BotModule,
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        url: process.env.DATABASE_URL + "?family=0",
        entities: [MissionEntity],
        synchronize: process.env.NODE_ENV === 'development',
        ssl: {
          rejectUnauthorized: false,
        },
        retryAttempts: 5,
        retryDelay: 3000,
        keepConnectionAlive: true,
        autoLoadEntities: true,
        logging: process.env.NODE_ENV === 'development',
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
  controllers: [HealthController],
  providers: [
    {
      provide: 'IDiscordService',
      useClass: DiscordClient,
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