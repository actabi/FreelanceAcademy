// src/bot/commands/command.service.ts
import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { DiscoveryService } from '@nestjs/core';
import { DiscordClient } from '../discord.client';
import { COMMAND_KEY } from '../decorators/command.decorator';
import { REST } from '@discordjs/rest';
import { Routes } from 'discord-api-types/v10';

@Injectable()
export class CommandService implements OnModuleInit {
  private readonly logger = new Logger(CommandService.name);

  constructor(
    private readonly discoveryService: DiscoveryService,
    private readonly discordClient: DiscordClient
  ) {}

  async onModuleInit() {
    // Vérifier si on est en mode Discord
    if (process.env.ENABLE_DISCORD === 'false') {
      this.logger.warn('Discord integration is disabled');
      return;
    }

    try {
      await this.registerCommands();
    } catch (error) {
      this.logger.error(`Failed to register Discord commands: ${(error as Error).message}`);
      // Ne pas faire échouer le démarrage de l'application si Discord échoue
      if (process.env.FAIL_ON_DISCORD_ERROR === 'true') {
        throw error;
      }
    }
  }

  private async registerCommands() {
    const token = process.env.DISCORD_TOKEN;
    const clientId = process.env.DISCORD_CLIENT_ID;

    if (!token || !clientId) {
      this.logger.warn('Discord configuration is missing - DISCORD_TOKEN and/or DISCORD_CLIENT_ID not defined');
      return;
    }

    const commands = this.discoveryService
      .getProviders()
      .filter(wrapper => wrapper.metatype)
      .map(wrapper => Reflect.getMetadata(COMMAND_KEY, wrapper.metatype))
      .filter(command => command);

    const rest = new REST({ version: '10' }).setToken(token);

    try {
      this.logger.log('Started refreshing application (/) commands.');

      await rest.put(
        Routes.applicationCommands(clientId),
        { body: commands }
      );

      this.logger.log('Successfully reloaded application (/) commands.');
    } catch (error) {
      this.logger.error('Failed to register commands:', error);
      throw error;
    }
  }
}