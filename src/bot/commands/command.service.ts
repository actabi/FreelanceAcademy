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
    if (this.configService.get('ENABLE_DISCORD') === 'false') {
      this.logger.warn('Discord integration is disabled');
      return;
    }

    try {
      await this.registerCommands();
    } catch (error) {
      this.logger.error(`Failed to register Discord commands: ${(error as Error).message}`);
      // Log plus détaillé pour le débogage
      this.logger.debug('Configuration actuelle:', {
        token: this.configService.get('DISCORD_TOKEN') ? 'Défini' : 'Non défini',
        clientId: this.configService.get('DISCORD_CLIENT_ID') ? 'Défini' : 'Non défini',
        guildId: this.configService.get('DISCORD_GUILD_ID') ? 'Défini' : 'Non défini'
      });
      
      if (process.env.FAIL_ON_DISCORD_ERROR === 'true') {
        throw error;
      }
    }
  }

  private async registerCommands() {
    const token = this.configService.get<string>('DISCORD_TOKEN');
    const clientId = this.configService.get<string>('DISCORD_CLIENT_ID');
    const guildId = this.configService.get<string>('DISCORD_GUILD_ID');

    // Log des valeurs pour le débogage
    this.logger.debug('Configuration Discord:', {
      hasToken: !!token,
      hasClientId: !!clientId,
      hasGuildId: !!guildId
    });

    if (!token || !clientId) {
      const missing = [];
      if (!token) missing.push('DISCORD_TOKEN');
      if (!clientId) missing.push('DISCORD_CLIENT_ID');
      
      this.logger.error(`Missing Discord configuration: ${missing.join(', ')}`);
      throw new Error(`Discord configuration is missing: ${missing.join(', ')}`);
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
      if (guildId) {
        // Commandes de serveur (pour le développement)
        this.logger.log(`Registering commands for guild ${guildId}...`);
        await rest.put(
          Routes.applicationGuildCommands(clientId, guildId),
          { body: commands }
        );
        this.logger.log(`Successfully registered ${commands.length} guild commands`);
      } else {
        // Commandes globales
        this.logger.log('Registering global commands...');
        await rest.put(
          Routes.applicationCommands(clientId),
          { body: commands }
        );
        this.logger.log(`Successfully registered ${commands.length} global commands`);
        this.logger.warn('Note: Global commands can take up to 1 hour to propagate');
      }

      // Log les commandes enregistrées
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