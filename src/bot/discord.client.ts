// src/bot/discord.client.ts
import { 
  Client, 
  TextChannel, 
  GatewayIntentBits,
  Partials,
  ButtonBuilder,
  ActionRowBuilder,
  ButtonStyle,
  MessageActionRowComponentBuilder
} from 'discord.js';
import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { IMission } from '../core/domain/interfaces/mission.interface';
import { MissionFormatter } from './interactions/mission.formatter';

@Injectable()
export class DiscordClient implements OnModuleInit {
  private readonly client: Client;
  private readonly logger = new Logger(DiscordClient.name);
  private clientReady = false;
  private readyPromise: Promise<void>;
  private resolveReady!: () => void;

  constructor(private readonly configService: ConfigService) {
    this.readyPromise = new Promise((resolve) => {
      this.resolveReady = resolve;
    });

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

    this.setupEventHandlers();
  }

  private setupEventHandlers() {
    this.client.on('ready', () => {
      this.logger.log(`Logged in as ${this.client.user?.tag}`);
      this.clientReady = true;
      this.resolveReady();
    });

    this.client.on('error', (error) => {
      this.logger.error('Discord client error:', error);
    });
  }

  async onModuleInit() {
    const isDiscordEnabled = this.configService.get('ENABLE_DISCORD') !== 'false';
    if (!isDiscordEnabled) {
      this.logger.warn('Discord integration is disabled');
      return;
    }

    try {
      await this.connect();
    } catch (error) {
      this.logger.error('Failed to initialize Discord client:', error);
      throw error;
    }
  }

  async connect(): Promise<void> {
    const token = this.configService.get<string>('DISCORD_TOKEN');
    if (!token) {
      throw new Error('DISCORD_TOKEN must be defined');
    }

    this.logger.log('Connecting to Discord...');
    
    try {
      await this.client.login(token);
      await this.waitForReady();
      this.logger.log('Discord client is fully initialized and ready');
    } catch (error) {
      this.logger.error('Failed to connect to Discord:', error);
      throw error;
    }
  }

  async waitForReady(timeout = 30000): Promise<void> {
    if (this.clientReady) return;

    try {
      await Promise.race([
        this.readyPromise,
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Discord client initialization timeout')), timeout)
        )
      ]);
    } catch (error) {
      this.logger.error('Failed waiting for Discord client to be ready:', error);
      throw error;
    }
  }

  getClient(): Client {
    if (!this.clientReady) {
      throw new Error('Discord client is not ready. Call waitForReady() first');
    }
    return this.client;
  }
  private async validateAndConnect(): Promise<void> {
    const token = this.configService.get<string>('DISCORD_TOKEN');
    if (!token) {
      throw new Error('DISCORD_TOKEN must be defined');
    }

    try {
      this.logger.log('Connecting to Discord...');
      await this.client.login(token);
      
      // Wait for client to be ready
      if (!this.clientReady) {
        await new Promise<void>((resolve, reject) => {
          const timeout = setTimeout(() => {
            reject(new Error('Timeout waiting for Discord client to be ready'));
          }, 30000);

          this.client.once('ready', () => {
            clearTimeout(timeout);
            this.clientReady = true; // Set the ready flag
            resolve();
          });
        });
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      this.logger.error(`Failed to connect to Discord: ${errorMessage}`);
      throw error;
    }
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