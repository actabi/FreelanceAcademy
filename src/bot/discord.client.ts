// src/bot/discord.client.ts
import { 
  Client, 
  TextChannel, 
  GatewayIntentBits,
  Partials
} from 'discord.js';
import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class DiscordClient implements OnModuleInit {
  private readonly client: Client;
  private readonly logger = new Logger(DiscordClient.name);
  private readonly isDiscordEnabled: boolean;

  constructor(private readonly configService: ConfigService) {
    this.client = new Client({
      intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.GuildMessageReactions,
        GatewayIntentBits.DirectMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildIntegrations
      ],
      partials: [
        Partials.Channel,
        Partials.Message,
        Partials.Reaction
      ]
    });

    this.isDiscordEnabled = this.configService.get('ENABLE_DISCORD') !== 'false';
  }

  async onModuleInit() {
    if (!this.isDiscordEnabled) {
      this.logger.warn('Discord integration is disabled');
      return;
    }

    try {
      await this.validateAndConnect();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      this.logger.error(`Failed to initialize Discord client: ${errorMessage}`);
      if (process.env.FAIL_ON_DISCORD_ERROR === 'true') {
        throw error;
      }
    }
  }

  private async validateAndConnect(): Promise<void> {
    const token = this.configService.get<string>('DISCORD_TOKEN');
    const channelId = this.configService.get<string>('DISCORD_CHANNEL_ID');
    const clientId = this.configService.get<string>('DISCORD_CLIENT_ID');
    const guildId = this.configService.get<string>('DISCORD_GUILD_ID');

    // Valider toutes les configurations requises
    const missingConfigs: string[] = [];
    if (!token) missingConfigs.push('DISCORD_TOKEN');
    if (!channelId) missingConfigs.push('DISCORD_CHANNEL_ID');
    if (!clientId) missingConfigs.push('DISCORD_CLIENT_ID');

    if (missingConfigs.length > 0) {
      this.logger.error(`Missing required Discord configurations: ${missingConfigs.join(', ')}`);
      throw new Error(`Missing required Discord configurations: ${missingConfigs.join(', ')}`);
    }

    // Vérifier le format du token
    if (!token || !/^[A-Za-z0-9_-]{24,}$/.test(token)) {
      this.logger.error('Invalid Discord token format. Please check your token in Discord Developer Portal');
      throw new Error('Invalid Discord token format');
    }

    this.logger.log('Connecting to Discord...');
    try {
      await this.client.login(token);
      this.logger.log('Successfully connected to Discord');

      // Log des informations de configuration pour le débogage
      this.logger.debug('Discord Configuration:', {
        clientId,
        guildId: guildId || 'Not set (using global commands)',
        channelId,
        botUsername: this.client.user?.tag
      });

    } catch (error) {
      this.logger.error('Failed to connect to Discord:', error);
      throw error;
    }
  }

  getClient(): Client {
    if (!this.client?.isReady()) {
      throw new Error('Discord client is not ready');
    }
    return this.client;
  }
}