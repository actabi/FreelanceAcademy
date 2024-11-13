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
import { IMission } from '../core/domain/interfaces/mission.interface';
import { MissionFormatter } from './interactions/mission.formatter';

@Injectable()
export class DiscordClient implements OnModuleInit {
  private readonly client: Client;
  private readonly logger = new Logger(DiscordClient.name);
  private readonly isDiscordEnabled: boolean;

  constructor() {
    this.client = new Client({
      intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.GuildMessageReactions,
        GatewayIntentBits.DirectMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers,  // Ajout pour les commandes slash
        GatewayIntentBits.GuildIntegrations  // Ajout pour les commandes slash
      ],
      partials: [
        Partials.Channel,
        Partials.Message,
        Partials.Reaction
      ]
    });

    this.isDiscordEnabled = process.env.ENABLE_DISCORD !== 'false';
  }

  async onModuleInit() {
    if (!this.isDiscordEnabled) {
      this.logger.warn('Discord integration is disabled');
      return;
    }

    const token = process.env.DISCORD_TOKEN;
    if (!token) {
      this.logger.error('DISCORD_TOKEN is not defined');
      if (process.env.FAIL_ON_DISCORD_ERROR === 'true') {
        throw new Error('DISCORD_TOKEN must be defined');
      }
      return;
    }

    try {
      await this.validateAndConnect(token);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      this.logger.error(`Failed to initialize Discord client: ${errorMessage}`);
      if (process.env.FAIL_ON_DISCORD_ERROR === 'true') {
        throw error;
      }
    }
  }

  private async validateAndConnect(token: string): Promise<void> {
    // Vérification basique du format du token
    if (!/^[A-Za-z0-9_-]{24,}$/.test(token)) {
      throw new Error('Invalid Discord token format');
    }

    try {
      await this.client.login(token);
      this.setupEventHandlers();
      this.logger.log('Discord client successfully connected');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      throw new Error(`Discord login failed: ${errorMessage}`);
    }
  }

  /**
   * Retourne l'instance du client Discord
   * @returns Client Discord.js
   */
  getClient(): Client {
    if (!this.client?.isReady()) {
      throw new Error('Discord client is not ready');
    }
    return this.client;
  }

  private setupEventHandlers() {
    this.client.on('ready', () => {
      this.logger.log(`Discord bot is ready! Logged in as ${this.client.user?.tag}`);
    });

    this.client.on('error', (error) => {
      this.logger.error('Discord client error:', error);
    });

    // Gestion de la déconnexion
    this.client.on('disconnect', () => {
      this.logger.warn('Discord client disconnected');
    });

    // Tentative de reconnexion
    this.client.on('reconnecting', () => {
      this.logger.log('Discord client attempting to reconnect...');
    });
  }

  async publishMission(mission: IMission): Promise<string | void> {
    try {
      const channelId = process.env.DISCORD_CHANNEL_ID;
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
      this.logger.error('Error publishing mission to Discord:', error);
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

  async sendDirectMessage(discordId: string, content: string): Promise<void> {
    try {
      const user = await this.client.users.fetch(discordId);
      if (user) {
        await user.send(content);
      }
    } catch (error) {
      this.logger.error(`Error sending DM to user ${discordId}:`, error);
      throw error;
    }
  }

  /**
   * Récupère un canal Discord par son ID
   * @param channelId ID du canal Discord
   * @returns TextChannel | null
   */
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