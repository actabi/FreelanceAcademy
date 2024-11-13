// src/core/services/notification.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { DiscordClient } from '../../bot/discord.client';
import { CacheService } from './cache.service';
import { IMission } from '../domain/interfaces/mission.interface';
import { MissionFormatter } from '../../bot/interactions/mission.formatter';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class NotificationService {
  private readonly logger = new Logger(NotificationService.name);
  
  constructor(
    private readonly discordClient: DiscordClient,
    private readonly cacheService: CacheService,
    private readonly configService: ConfigService
  ) {}

  async notifyNewMission(mission: IMission): Promise<void> {
    try {
      const channelId = this.configService.get<string>('DISCORD_CHANNEL_ID');
      if (!channelId) {
        throw new Error('DISCORD_CHANNEL_ID not configured');
      }

      const messageId = await this.discordClient.publishMission(mission);
      if (messageId) {
        const updatedMission = {
          ...mission,
          discordMessageId: messageId,
        };
        
        await this.cacheService.setMission(updatedMission);
        await this.notifyMatchingFreelances(updatedMission);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      this.logger.error(`Failed to publish mission ${mission.id}: ${errorMessage}`);
      throw new Error(`Failed to publish mission ${mission.id}: ${errorMessage}`);
    }
  }

  async updatePublishedMission(mission: IMission): Promise<void> {
    if (!mission.discordMessageId) {
      throw new Error('Cannot update mission: no Discord message ID found');
    }

    try {
      const channelId = this.configService.get<string>('DISCORD_CHANNEL_ID');
      if (!channelId) {
        throw new Error('DISCORD_CHANNEL_ID not configured');
      }

      const channel = await this.discordClient.getChannel(channelId);
      if (!channel) {
        throw new Error('Invalid Discord channel or channel type');
      }

      const message = await channel.messages.fetch(mission.discordMessageId);
      if (!message) {
        throw new Error('Discord message not found');
      }

      const updatedEmbed = MissionFormatter.formatForDiscord(mission);
      await message.edit({ embeds: [updatedEmbed] });
      await this.cacheService.setMission(mission);

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      this.logger.error(`Failed to update mission ${mission.id}: ${errorMessage}`);
      throw new Error(`Failed to update mission ${mission.id}: ${errorMessage}`);
    }
  }

  private async notifyMatchingFreelances(mission: IMission): Promise<void> {
    try {
      const matchingFreelances = await this.findMatchingFreelances(mission);
      
      for (const freelance of matchingFreelances) {
        await this.sendFreelanceNotification(freelance, mission);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      this.logger.error(`Error notifying matching freelances: ${errorMessage}`);
    }
  }

  private async findMatchingFreelances(mission: IMission): Promise<any[]> {
    // Implémentation du matching à faire
    return [];
  }

  private async sendFreelanceNotification(freelance: any, mission: IMission): Promise<void> {
    try {
      if (freelance.discordId) {
        const message = this.formatNotificationMessage(mission);
        await this.discordClient.sendDirectMessage(freelance.discordId, message);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      this.logger.error(`Error sending notification to freelance ${freelance.id}: ${errorMessage}`);
    }
  }

  private formatNotificationMessage(mission: IMission): string {
    return `🚨 Nouvelle mission correspondant à votre profil !\n\n` +
           `**${mission.title}**\n` +
           `💰 TJM : ${mission.dailyRateMin}€ - ${mission.dailyRateMax}€\n` +
           `📍 Localisation : ${mission.location}\n` +
           `\nUtilisez /mission ${mission.id} pour plus de détails.`;
  }
}