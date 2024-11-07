// src/bot/discord.client.ts
import { 
    Client, 
    TextChannel, 
    EmbedBuilder,
    GatewayIntentBits,
    ButtonBuilder,
    ActionRowBuilder,
    ButtonStyle
  } from 'discord.js';
  import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
  import { ConfigService } from '@nestjs/config';
  import { IMission } from '../core/domain/models/mission.model';
  import { MissionFormatter } from './interactions/mission.formatter';
  
  @Injectable()
  export class DiscordClient implements OnModuleInit {
    private client: Client;
    private readonly logger = new Logger(DiscordClient.name);
  
    constructor(private configService: ConfigService) {
      this.client = new Client({
        intents: [
          GatewayIntentBits.Guilds,
          GatewayIntentBits.GuildMessages,
          GatewayIntentBits.GuildMessageReactions,
          GatewayIntentBits.DirectMessages,
          GatewayIntentBits.MessageContent
        ]
      });
  
      this.setupEventHandlers();
    }
  
    async onModuleInit() {
      const token = this.configService.get<string>('DISCORD_TOKEN');
      if (!token) {
        throw new Error('DISCORD_TOKEN must be defined');
      }
      await this.client.login(token);
    }
  
    private setupEventHandlers() {
      this.client.on('ready', () => {
        this.logger.log(`Discord bot is ready! Logged in as ${this.client.user?.tag}`);
      });
  
      this.client.on('error', (error) => {
        this.logger.error('Discord client error:', error);
      });
    }
  
    async publishMission(mission: IMission): Promise<void> {
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
    }
  
    private createMissionButtons(mission: IMission): ActionRowBuilder {
      return new ActionRowBuilder()
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
  }