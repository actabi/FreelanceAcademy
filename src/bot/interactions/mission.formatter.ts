// src/bot/interactions/mission.formatter.ts
import { EmbedBuilder } from 'discord.js';
import { IMission } from '../../core/domain/interfaces/mission.interface';

export class MissionFormatter {
  static formatForDiscord(mission: IMission): EmbedBuilder {
    return new EmbedBuilder()
      .setTitle(`🚀 Nouvelle Mission : ${mission.title}`)
      .setColor('#0099ff')
      .addFields(
        { 
          name: '💼 Description', 
          value: this.truncateText(mission.description, 1024) 
        },
        { 
          name: '💰 TJM', 
          value: `${mission.dailyRateMin}€ - ${mission.dailyRateMax}€`, 
          inline: true 
        },
        { 
          name: '📅 Durée', 
          value: this.formatDuration(mission), 
          inline: true 
        },
        { 
          name: '📍 Localisation', 
          value: mission.location, 
          inline: true 
        },
        { 
          name: '🛠️ Compétences', 
          value: mission.skills.join(', ') || 'Non spécifié' 
        }
      )
      .setTimestamp();
  }

  private static truncateText(text: string, maxLength: number): string {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength - 3) + '...';
  }

  private static formatDuration(mission: IMission): string {
    if (!mission.startDate || !mission.endDate) {
      return 'Non spécifié';
    }
    const days = Math.ceil(
      (mission.endDate.getTime() - mission.startDate.getTime()) / 
      (1000 * 60 * 60 * 24)
    );
    return `${days} jours`;
  }
}