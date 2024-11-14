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
      this.logger.log('Initializing commands...');
      await this.registerCommands();
      await this.setupCommandHandlers();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error('Failed to initialize commands:', errorMessage);
      if (process.env.NODE_ENV === 'development') {
        throw error;
      }
    }
  }

  private async registerCommands() {
    const token = this.configService.get<string>('DISCORD_TOKEN');
    const clientId = this.configService.get<string>('DISCORD_CLIENT_ID');
    const guildId = this.configService.get<string>('DISCORD_GUILD_ID');

    if (!token || !clientId) {
      throw new Error('Missing required Discord configuration (token or clientId)');
    }

    // Enregistrement des commandes injectées
    if (this.injectedCommands && this.injectedCommands.length > 0) {
      this.injectedCommands.forEach(CommandClass => {
        const instance = new CommandClass();
        const metadata = Reflect.getMetadata(COMMAND_KEY, CommandClass);
        if (metadata) {
          this.commands.set(metadata.name, { metadata, instance });
        }
      });
    }

    // Découverte des commandes via le DiscoveryService
    const providers = this.discoveryService.getProviders();
    const commandProviders = providers.filter(wrapper => {
      return wrapper.instance && 
             wrapper.metatype &&
             Reflect.hasMetadata(COMMAND_KEY, wrapper.metatype);
    });

    commandProviders.forEach(wrapper => {
      const metadata = Reflect.getMetadata(COMMAND_KEY, wrapper.metatype);
      if (metadata) {
        this.commands.set(metadata.name, {
          metadata,
          instance: wrapper.instance
        });
      }
    });

    if (this.commands.size === 0) {
      this.logger.warn('No commands registered');
      return;
    }

    const rest = new REST({ version: '10' }).setToken(token);
    const commandsData = Array.from(this.commands.values()).map(cmd => cmd.metadata);

    try {
      this.logger.log(`Registering ${commandsData.length} commands...`);
      
      if (guildId) {
        await rest.put(
          Routes.applicationGuildCommands(clientId, guildId),
          { body: commandsData }
        );
        this.logger.log('Successfully registered guild commands');
      } else {
        await rest.put(
          Routes.applicationCommands(clientId),
          { body: commandsData }
        );
        this.logger.log('Successfully registered global commands');
      }
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
        
        if (!interaction.replied && !interaction.deferred) {
          await interaction.reply({ 
            content: 'Une erreur est survenue lors de l\'exécution de la commande.',
            ephemeral: true 
          });
        }
      }
    });
  }
}