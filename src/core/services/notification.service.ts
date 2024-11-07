import { Injectable } from '@nestjs/common';
import { DiscordClient } from '../../bot/discord.client';
import { CacheService } from './cache.service';
import { IMission } from '../domain/interfaces/mission.interfaces';

@Injectable()
export class NotificationService {
  constructor(
    private readonly discordClient: DiscordClient,
    private readonly cacheService: CacheService
  ) {}

  async notifyNewMission(mission: IMission): Promise<void> {
    try {
      // Publier sur Discord et attendre l'ID du message
      const messageId = await this.discordClient.publishMission(mission);
      
      if (messageId) {
        // Créer une copie modifiée de la mission
        const updatedMission: IMission = {
          ...mission,
          discordMessageId: messageId,
        };
        
        // Mettre à jour le cache avec la version mise à jour
        await this.cacheService.setMission(mission.id, updatedMission);

        // Notifier les freelances correspondants
        await this.notifyMatchingFreelances(updatedMission);
      } else {
        console.error('No Discord message ID returned for mission:', mission.id);
      }
    } catch (error) {
      console.error('Error publishing mission to Discord:', error);
      
      // Vous pouvez choisir de relancer l'erreur ou de la gérer ici
      if (error instanceof Error) {
        throw new Error(`Failed to publish mission ${mission.id} to Discord: ${error.message}`);
      } else {
        throw new Error(`Failed to publish mission ${mission.id} to Discord: Unknown error`);
      }
    }
  }

  private async notifyMatchingFreelances(mission: IMission): Promise<void> {
    try {
      // Exemple d'implémentation de base
      // 1. Récupérer les freelances qui correspondent aux critères de la mission
      const matchingFreelances = await this.findMatchingFreelances(mission);
      
      // 2. Envoyer une notification à chaque freelance
      for (const freelance of matchingFreelances) {
        await this.sendFreelanceNotification(freelance, mission);
      }
    } catch (error) {
      console.error('Error notifying matching freelances:', error);
    }
  }

  private async findMatchingFreelances(mission: IMission): Promise<any[]> {
    // TODO: Implémenter la logique de matching
    // Par exemple, trouver les freelances avec les compétences requises
    return [];
  }

  private async sendFreelanceNotification(freelance: any, mission: IMission): Promise<void> {
    try {
      if (freelance.discordId) {
        await this.discordClient.sendDirectMessage(
          freelance.discordId,
          this.formatNotificationMessage(mission)
        );
      }
    } catch (error) {
      console.error(`Error sending notification to freelance ${freelance.id}:`, error);
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