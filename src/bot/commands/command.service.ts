// src/bot/commands/command.service.ts
import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { DiscoveryService } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { DiscordClient } from '../discord.client';
import { COMMAND_KEY } from '../decorators/command.decorator';
import { REST } from '@discordjs/rest';
import { Routes } from 'discord-api-types/v10';
import { Inject, Optional } from '@nestjs/common';
import { Collection } from 'discord.js';

interface CommandInstance {
  metadata: any;
  instance: any;
}

@Injectable()
export class CommandService implements OnModuleInit {
  private readonly logger = new Logger(CommandService.name);
  private commands = new Collection<string, CommandInstance>();

  constructor(
    private readonly discoveryService: DiscoveryService,
    private readonly discordClient: DiscordClient,
    private readonly configService: ConfigService,
    @Optional() @Inject('DISCORD_COMMANDS') private readonly injectedCommands: any[] = []
  ) {}

  async onModuleInit() {
    const isDiscordEnabled = this.configService.get('ENABLE_DISCORD') !== 'false';
    if (!isDiscordEnabled) {
      this.logger.warn('Discord integration is disabled');
      return;
    }

    try {
      await this.registerCommands();
      await this.setupCommandHandlers();
    } catch (error) {
      this.logger.error(`Failed to initialize commands: ${(error as Error).message}`);
      throw error;
    }
  }

  private async registerCommands() {
    const token = this.configService.get<string>('DISCORD_TOKEN');
    const clientId = this.configService.get<string>('DISCORD_CLIENT_ID');
    const guildId = this.configService.get<string>('DISCORD_GUILD_ID');

    if (!token || !clientId) {
      throw new Error('Token ou ClientId manquant');
    }

    // Découverte des commandes via le DiscoveryService
    const providers = this.discoveryService.getProviders();
    const commandProviders = providers.filter(wrapper => {
      const metadata = Reflect.getMetadata(COMMAND_KEY, wrapper.metatype);
      return metadata && wrapper.instance;
    });

    // Création de la collection des commandes avec leurs instances
    commandProviders.forEach(wrapper => {
      const metadata = Reflect.getMetadata(COMMAND_KEY, wrapper.metatype);
      this.commands.set(metadata.name, {
        metadata,
        instance: wrapper.instance
      });
    });

    // Préparation des métadonnées pour l'API Discord
    const commandsData = Array.from(this.commands.values()).map(cmd => cmd.metadata);

    if (!commandsData.length) {
      this.logger.warn('No commands found to register');
      return;
    }

    this.logger.log(`Found ${commandsData.length} commands to register`);

    const rest = new REST({ version: '10' }).setToken(token);

    try {
      this.logger.log('Started refreshing application (/) commands.');

      if (guildId) {
        await rest.put(
          Routes.applicationGuildCommands(clientId, guildId),
          { body: commandsData }
        );
        this.logger.log(`Successfully registered ${commandsData.length} guild commands.`);
      } else {
        await rest.put(
          Routes.applicationCommands(clientId),
          { body: commandsData }
        );
        this.logger.log(`Successfully registered ${commandsData.length} global commands.`);
      }

      commandsData.forEach(cmd => {
        this.logger.log(`Registered command: ${cmd.name}`);
      });
    } catch (error) {
      this.logger.error('Failed to register commands:', error);
      throw error;
    }
  }

  private async setupCommandHandlers() {
    const client = this.discordClient.getClient();
    
    client.on('interactionCreate', async interaction => {
      if (!interaction.isCommand()) return;

      const command = this.commands.get(interaction.commandName);
      if (!command) {
        this.logger.warn(`Command not found: ${interaction.commandName}`);
        return;
      }

      try {
        await command.instance.execute(interaction);
      } catch (error) {
        this.logger.error(`Error executing command ${interaction.commandName}:`, error);
        await interaction.reply({ 
          content: 'Une erreur est survenue lors de l\'exécution de la commande.',
          ephemeral: true 
        });
      }
    });

    this.logger.log('Command handlers setup completed');
  }
}