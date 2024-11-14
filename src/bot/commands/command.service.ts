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
    try {
      // Vérifier d'abord si Discord est activé
      const isDiscordEnabled = this.configService.get('ENABLE_DISCORD') !== 'false';
      if (!isDiscordEnabled) {
        this.logger.warn('Discord integration is disabled');
        return;
      }

      // Attendre que le client Discord soit prêt
      await this.waitForDiscordClient();

      // Enregistrer les commandes
      await this.registerCommands();

      // Configurer les gestionnaires de commandes
      await this.setupCommandHandlers();

    } catch (error) {
      this.logger.error('Failed to initialize CommandService:', {
        error: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined
      });
      
      // En développement, on veut voir l'erreur complète
      if (process.env.NODE_ENV === 'development') {
        throw error;
      } else {
        // En production, on veut continuer même si les commandes ne sont pas chargées
        this.logger.warn('Continuing without Discord commands...');
      }
    }
  }

  private async waitForDiscordClient(timeout = 30000): Promise<void> {
    const startTime = Date.now();
    
    while (!this.discordClient.getClient()?.isReady()) {
      if (Date.now() - startTime > timeout) {
        throw new Error('Timeout waiting for Discord client to be ready');
      }
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    this.logger.log('Discord client is ready');
  }

  private async registerCommands() {
    // Vérifier les variables d'environnement requises
    const token = this.configService.get<string>('DISCORD_TOKEN');
    const clientId = this.configService.get<string>('DISCORD_CLIENT_ID');
    const guildId = this.configService.get<string>('DISCORD_GUILD_ID');

    this.logger.debug('Configuration check:', {
      hasToken: !!token,
      hasClientId: !!clientId,
      hasGuildId: !!guildId,
      env: process.env.NODE_ENV
    });

    if (!token || !clientId) {
      throw new Error('Missing required Discord configuration (token or clientId)');
    }

    // Découverte des commandes
    const providers = this.discoveryService.getProviders();
    
    this.logger.debug(`Found ${providers.length} providers`);
    
    const commandProviders = providers.filter(wrapper => {
      const hasMetadata = !!Reflect.getMetadata(COMMAND_KEY, wrapper.metatype);
      const hasInstance = !!wrapper.instance;
      
      this.logger.debug(`Provider check: ${wrapper.metatype?.name}`, {
        hasMetadata,
        hasInstance
      });
      
      return hasMetadata && hasInstance;
    });

    // Création de la collection des commandes
    commandProviders.forEach(wrapper => {
      const metadata = Reflect.getMetadata(COMMAND_KEY, wrapper.metatype);
      this.commands.set(metadata.name, {
        metadata,
        instance: wrapper.instance
      });
    });

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
        const result = await rest.put(
          Routes.applicationGuildCommands(clientId, guildId),
          { body: commandsData }
        );
        this.logger.log(`Successfully registered ${commandsData.length} guild commands`);
        this.logger.debug('Registration result:', result);
      } else {
        const result = await rest.put(
          Routes.applicationCommands(clientId),
          { body: commandsData }
        );
        this.logger.log(`Successfully registered ${commandsData.length} global commands`);
        this.logger.debug('Registration result:', result);
      }

    } catch (error) {
      this.logger.error('Failed to register commands:', {
        error: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined
      });
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
        this.logger.debug(`Executing command: ${interaction.commandName}`);
        await command.instance.execute(interaction);
      } catch (error) {
        this.logger.error(`Error executing command ${interaction.commandName}:`, {
          error: error instanceof Error ? error.message : 'Unknown error',
          stack: error instanceof Error ? error.stack : undefined
        });
        
        try {
          if (!interaction.replied && !interaction.deferred) {
            await interaction.reply({ 
              content: 'Une erreur est survenue lors de l\'exécution de la commande.',
              ephemeral: true 
            });
          }
        } catch (replyError) {
          this.logger.error('Failed to send error message to user:', replyError);
        }
      }
    });

    this.logger.log('Command handlers setup completed');
  }
}