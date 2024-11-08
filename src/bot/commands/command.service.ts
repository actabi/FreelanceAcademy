// src/bot/services/command.service.ts
import { Injectable, OnModuleInit } from '@nestjs/common';
import { DiscoveryService } from '@nestjs/core';
import { DiscordClient } from '../discord.client';
import { COMMAND_KEY } from '../decorators/command.decorator';
import { REST } from '@discordjs/rest';
import { Routes } from 'discord-api-types/v10';

@Injectable()
export class CommandService implements OnModuleInit {
  constructor(
    private readonly discoveryService: DiscoveryService,
    private readonly discordClient: DiscordClient
  ) {}

  async onModuleInit() {
    await this.registerCommands();
  }

  private async registerCommands() {
    const commands = this.discoveryService
      .getProviders()
      .filter(wrapper => wrapper.metatype)
      .map(wrapper => Reflect.getMetadata(COMMAND_KEY, wrapper.metatype))
      .filter(command => command);

    const token = process.env.DISCORD_TOKEN;
    const clientId = process.env.DISCORD_CLIENT_ID;

    if (!token || !clientId) {
      throw new Error('DISCORD_TOKEN and DISCORD_CLIENT_ID must be defined');
    }

    const rest = new REST({ version: '10' }).setToken(token);

    try {
      console.log('Started refreshing application (/) commands.');

      await rest.put(
        Routes.applicationCommands(clientId),
        { body: commands }
      );

      console.log('Successfully reloaded application (/) commands.');
    } catch (error) {
      console.error('Failed to register commands:', error);
      throw error;
    }
  }
}