// src/bot/commands/command.service.ts
import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { DiscoveryService } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { DiscordClient } from '../discord.client';
import { COMMAND_KEY } from '../decorators/command.decorator';
import { REST } from '@discordjs/rest';
import { Routes } from 'discord-api-types/v10';
import { Inject, Optional } from '@nestjs/common';

@Injectable()
export class CommandService implements OnModuleInit {
  private readonly logger = new Logger(CommandService.name);

  constructor(
    private readonly discoveryService: DiscoveryService,
    private readonly discordClient: DiscordClient,
    private readonly configService: ConfigService,
    @Optional() @Inject('DISCORD_COMMANDS') private readonly commands: any[] = []
  ) {}

  async onModuleInit() {
    const isDiscordEnabled = this.configService.get('ENABLE_DISCORD') !== 'false';
    if (!isDiscordEnabled) {
      this.logger.warn('Discord integration is disabled');
      return;
    }

    try {
      await this.registerCommands();
    } catch (error) {
      this.logger.error(`Failed to register Discord commands: ${(error as Error).message}`);
      this.logger.debug('Configuration actuelle:', {
        token: this.configService.get('DISCORD_TOKEN') ? 'Défini' : 'Non défini',
        clientId: this.configService.get('DISCORD_CLIENT_ID') ? 'Défini' : 'Non défini',
        guildId: this.configService.get('DISCORD_GUILD_ID') ? 'Défini' : 'Non défini'
      });
    }
  }

  private async registerCommands() {
    const token = this.configService.get<string>('DISCORD_TOKEN');
    const clientId = this.configService.get<string>('DISCORD_CLIENT_ID');
    const guildId = this.configService.get<string>('DISCORD_GUILD_ID');

    if (!token || !clientId) {
      throw new Error('Token ou ClientId manquant');
    }

    // Découverte des commandes via le decorator ET les commandes injectées
    const decoratedCommands = this.discoveryService
      .getProviders()
      .filter(wrapper => wrapper.metatype)
      .map(wrapper => Reflect.getMetadata(COMMAND_KEY, wrapper.metatype))
      .filter(Boolean);

    const injectedCommands = this.commands
      .map(cmd => Reflect.getMetadata(COMMAND_KEY, cmd))
      .filter(Boolean);

    const allCommands = [...new Set([...decoratedCommands, ...injectedCommands])];

    if (!allCommands.length) {
      this.logger.warn('No commands found to register');
      this.logger.debug('Available providers:', 
        this.discoveryService.getProviders()
          .map(wrapper => wrapper.metatype?.name)
          .filter(Boolean)
      );
      return;
    }

    this.logger.log(`Found ${allCommands.length} commands to register`);

    const rest = new REST({ version: '10' }).setToken(token);

    try {
      if (guildId) {
        await rest.put(
          Routes.applicationGuildCommands(clientId, guildId),
          { body: allCommands }
        );
        this.logger.log(`Registered ${allCommands.length} guild commands`);
      } else {
        await rest.put(
          Routes.applicationCommands(clientId),
          { body: allCommands }
        );
        this.logger.log(`Registered ${allCommands.length} global commands`);
      }

      allCommands.forEach(cmd => {
        this.logger.log(`Registered command: ${cmd.name}`);
      });
    } catch (error) {
      this.logger.error('Failed to register commands:', error);
      throw error;
    }
  }
}