// src/bot/bot.module.ts
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NotificationModule } from '../core/notification/notification.module';
import { DiscoveryModule } from '@nestjs/core';
import { DiscordClient } from './discord.client';
import { MissionCommands } from './commands/mission.commands';
import { ProfileCommand } from './commands/profile.command';
import { AlertCommand } from './commands/alert.command';
import { CommandService } from './commands/command.service';
import { MissionService } from '../core/services/mission.service';
import { FreelanceService } from '../core/services/freelance.service';
import { AlertService } from '../core/services/alert.service';
import { MissionEntity } from '../core/domain/entities/mission.entity';
import { FreelanceEntity } from '../core/domain/entities/freelance.entity';
import { SkillEntity } from '../core/domain/entities/skill.entity';
import { AlertEntity } from '../core/domain/entities/alert.entity';
import { CacheService } from '../core/services/cache.service';
import { RedisService } from '../core/services/redis.service';

@Module({
  imports: [
    ConfigModule,
    NotificationModule,
    DiscoveryModule,
    TypeOrmModule.forFeature([
      MissionEntity,
      FreelanceEntity,
      SkillEntity,
      AlertEntity  // Ajout de l'entité Alert
    ]),
  ],
  providers: [
    DiscordClient,
    CommandService,
    MissionCommands,
    ProfileCommand,
    AlertCommand,
    MissionService,
    FreelanceService,
    AlertService,   // Ajout du service Alert
    CacheService,
    RedisService    // Nécessaire pour CacheService
  ],
  exports: [DiscordClient]
})
export class BotModule {}