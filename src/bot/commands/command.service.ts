// src/bot/commands/command.service.ts
import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { DiscoveryService } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { DiscordClient } from '../discord.client';
import { COMMAND_KEY } from '../decorators/command.decorator';
import { REST } from '@discordjs/rest';
import { Routes } from 'discord-api-types/v10';

@Injectable()
export class CommandService implements OnModuleInit {
  private readonly logger = new Logger(CommandService.name);

  constructor(
    private readonly discoveryService: DiscoveryService,
    private readonly discordClient: DiscordClient,
    private readonly configService: ConfigService
  ) {}

  async onModuleInit() {
    if (process.env.ENABLE_DISCORD === 'false') {
      this.logger.warn('Discord integration is disabled');
      return;
    }

    try {
      await this.registerCommands();
    } catch (error) {
      this.logger.error(`Failed to register Discord commands: ${(error as Error).message}`);
      if (process.env.FAIL_ON_DISCORD_ERROR === 'true') {
        throw error;
      }
    }
  }

  private async registerCommands() {
    const token = this.configService.get<string>('discord.token');
    const clientId = this.configService.get<string>('discord.clientId');
    const guildId = this.configService.get<string>('discord.guildId');

    if (!token || !clientId) {
      throw new Error('Discord configuration is missing - token or clientId not defined');
    }

    const commands = this.discoveryService
      .getProviders()
      .filter(wrapper => wrapper.metatype)
      .map(wrapper => Reflect.getMetadata(COMMAND_KEY, wrapper.metatype))
      .filter(command => command);

    if (!commands.length) {
      this.logger.warn('No commands found to register');
      return;
    }

    const rest = new REST({ version: '10' }).setToken(token);

    try {
      // Si nous avons un GUILD_ID, enregistrer les commandes au niveau du serveur
      if (guildId) {
        this.logger.log(`Registering commands for guild ${guildId}...`);
        await rest.put(
          Routes.applicationGuildCommands(clientId, guildId),
          { body: commands }
        );
        this.logger.log(`Successfully registered ${commands.length} commands for guild ${guildId}`);
      } else {
        // Sinon, enregistrer les commandes globalement
        this.logger.log('Registering global commands...');
        await rest.put(
          Routes.applicationCommands(clientId),
          { body: commands }
        );
        this.logger.log(`Successfully registered ${commands.length} global commands`);
        this.logger.warn('Note: Global commands can take up to 1 hour to propagate');
      }

      // Log les commandes enregistrées pour le débogage
      this.logger.debug('Registered commands:', commands.map(cmd => cmd.name));
    } catch (error) {
      if (error instanceof Error) {
        this.logger.error('Failed to register commands:', error.message);
        if (error.stack) {
          this.logger.debug('Stack trace:', error.stack);
        }
      }
      throw error;
    }
  }
}