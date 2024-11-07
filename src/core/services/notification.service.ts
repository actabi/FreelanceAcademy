// src/core/services/notification.service.ts
import { Injectable } from '@nestjs/common';
import { IMission } from '../domain/interfaces/mission.interface';
import { DiscordClient } from '../../bot/discord.client';
import { CacheService } from './cache.service';

@Injectable()
export class NotificationService {
  constructor(
    private readonly discordClient: DiscordClient,
    private readonly cacheService: CacheService
  ) {}

  async notifyNewMission(mission: IMission): Promise<void> {
    // Publier sur Discord
    const messageId = await this.discordClient.publishMission(mission);

    // Stocker l'ID du message Discord
    mission.discordMessageId = messageId;
    
    // Mettre à jour le cache
    await this.cacheService.setMission(mission.id, mission);

    // Notifier les freelances correspondants (via matching)
    await this.notifyMatchingFreelances(mission);
  }

  private async notifyMatchingFreelances(mission: IMission): Promise<void> {
    // Logique de notification des freelances matchant la mission
    // Implémenter selon les besoins spécifiques
  }
}