// src/bot/discord.client.ts
import { 
  Client, 
  TextChannel, 
  GatewayIntentBits,
  Partials,
  ButtonBuilder,
  ActionRowBuilder,
  ButtonStyle,
  MessageActionRowComponentBuilder,
  User
} from 'discord.js';
import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { IMission } from '../core/domain/interfaces/mission.interface';
import { MissionFormatter } from './interactions/mission.formatter';

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

    try {
      await this.client.login(token);
      this.logger.log('Successfully connected to Discord');

      // Configurer les gestionnaires d'événements
      this.setupEventHandlers();

    } catch (error) {
      this.logger.error('Failed to connect to Discord:', error);
      throw error;
    }
  }

  private setupEventHandlers() {
    this.client.on('ready', () => {
      this.logger.log(`Logged in as ${this.client.user?.tag}`);
    });

    this.client.on('error', (error) => {
      this.logger.error('Discord client error:', error);
    });
  }

  async publishMission(mission: IMission): Promise<string> {
    try {
      const channelId = this.configService.get<string>('DISCORD_CHANNEL_ID');
      if (!channelId) {
        throw new Error('DISCORD_CHANNEL_ID must be defined');
      }

      const channel = await this.client.channels.fetch(channelId);
      if (!channel || !(channel instanceof TextChannel)) {
        throw new Error('Invalid Discord channel');
      }

      const embed = MissionFormatter.formatForDiscord(mission);
      const components = this.createMissionButtons(mission);

      const message = await channel.send({
        embeds: [embed],
        components: [components]
      });

      return message.id;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      this.logger.error(`Error publishing mission: ${errorMessage}`);
      throw error;
    }
  }

  async sendDirectMessage(discordId: string, content: string): Promise<void> {
    try {
      const user = await this.client.users.fetch(discordId);
      if (!user) {
        throw new Error(`User not found: ${discordId}`);
      }

      await user.send(content);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      this.logger.error(`Error sending DM to user ${discordId}: ${errorMessage}`);
      throw error;
    }
  }

  private createMissionButtons(mission: IMission): ActionRowBuilder<MessageActionRowComponentBuilder> {
    return new ActionRowBuilder<MessageActionRowComponentBuilder>()
      .addComponents(
        new ButtonBuilder()
          .setCustomId(`apply_${mission.id}`)
          .setLabel('Postuler')
          .setStyle(ButtonStyle.Primary),
        new ButtonBuilder()
          .setCustomId(`details_${mission.id}`)
          .setLabel('Plus de détails')
          .setStyle(ButtonStyle.Secondary)
      );
  }

  getClient(): Client {
    if (!this.client?.isReady()) {
      throw new Error('Discord client is not ready');
    }
    return this.client;
  }

  async getChannel(channelId: string): Promise<TextChannel | null> {
    try {
      const channel = await this.client.channels.fetch(channelId);
      if (channel instanceof TextChannel) {
        return channel;
      }
      return null;
    } catch (error) {
      this.logger.error(`Error fetching channel ${channelId}:`, error);
      return null;
    }
  }
}