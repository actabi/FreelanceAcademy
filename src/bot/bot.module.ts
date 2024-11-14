// src/bot/bot.module.ts
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DiscoveryModule } from '@nestjs/core';
import { TestCommand } from './commands/test.command';
import { CommandService } from './commands/command.service';
import { DiscordClient } from './discord.client';

@Module({
  imports: [
    ConfigModule,
    DiscoveryModule,  // Important : DiscoveryModule ici
  ],
  providers: [
    DiscordClient,
    CommandService,
    TestCommand,
    {
      provide: 'DISCORD_COMMANDS',
      useValue: [] // Tableau vide pour l'instant
    }
  ],
  exports: [DiscordClient]
})
export class BotModule {}