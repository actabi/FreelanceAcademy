// src/bot/bot.module.ts
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DiscoveryModule } from '@nestjs/core';
import { MissionCommands } from './commands/mission.commands';
import { ProfileCommand } from './commands/profile.command';
import { AlertCommand } from './commands/alert.command';
import { TestCommand } from './commands/test.command';
import { CommandService } from './commands/command.service';
import { DiscordClient } from './discord.client';

@Module({
  imports: [
    ConfigModule,
    DiscoveryModule,
  ],
  providers: [
    DiscordClient,
    CommandService,
    TestCommand,
    MissionCommands,
    ProfileCommand,
    AlertCommand,
    {
      provide: 'DISCORD_COMMANDS',
      useValue: [TestCommand, MissionCommands, ProfileCommand, AlertCommand]
    }
  ],
  exports: [DiscordClient]
})
export class BotModule {}