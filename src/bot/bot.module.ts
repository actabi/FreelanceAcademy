// src/bot/bot.module.ts
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DiscoveryModule } from '@nestjs/core';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MissionCommands } from './commands/mission.commands';
import { ProfileCommand } from './commands/profile.command';
import { AlertCommand } from './commands/alert.command';
import { TestCommand } from './commands/test.command';
import { CommandService } from './commands/command.service';
import { DiscordClient } from './discord.client';
import { MissionService } from '../core/services/mission.service';
import { FreelanceService } from '../core/services/freelance.service';
import { AlertService } from '../core/services/alert.service';
import { NotificationService } from '../core/services/notification.service';
import { CacheService } from '../core/services/cache.service';
import { MissionEntity } from '../core/domain/entities/mission.entity';
import { FreelanceEntity } from '../core/domain/entities/freelance.entity';
import { SkillEntity } from '../core/domain/entities/skill.entity';
import { AlertEntity } from '../core/domain/entities/alert.entity';
import { ApplicationEntity } from '../core/domain/entities/application.entity';
import { NotificationModule } from '../core/notification/notification.module';
import { RedisModule } from '../core/redis/redis.module';

@Module({
  imports: [
    ConfigModule,
    DiscoveryModule,
    TypeOrmModule.forFeature([
      MissionEntity,
      FreelanceEntity,
      SkillEntity,
      AlertEntity,
      ApplicationEntity
    ]),
    NotificationModule,
    RedisModule
  ],
  providers: [
    // Base Services
    DiscordClient,
    
    // Core Services
    MissionService,
    FreelanceService,
    AlertService,
    CacheService,
    
    // Commands (must be after services)
    TestCommand,
    MissionCommands,
    ProfileCommand,
    AlertCommand,
    
    // Command Service (must be last)
    CommandService,
    
    {
      provide: 'DISCORD_COMMANDS',
      useValue: [TestCommand, MissionCommands, ProfileCommand, AlertCommand]
    }
  ],
  exports: [DiscordClient]
})
export class BotModule {}