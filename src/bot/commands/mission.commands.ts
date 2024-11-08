// src/bot/commands/mission.commands.ts
import { Injectable } from '@nestjs/common';
import { CommandInteraction, ApplicationCommandOptionType } from 'discord.js';
import { Command } from '../decorators/command.decorator';
import { MissionService } from '../../core/services/mission.service';

@Injectable()
export class MissionCommands {
  constructor(private readonly missionService: MissionService) {}

  @Command({
    name: 'missions',
    description: 'Liste des missions disponibles'
  })
  async listMissions(interaction: CommandInteraction) {
    if (!interaction.isChatInputCommand()) return;

    try {
      const missions = await this.missionService.findAll();
      
      if (missions.length === 0) {
        await interaction.reply({
          content: 'Aucune mission disponible actuellement.',
          ephemeral: true
        });
        return;
      }

      const missionsList = missions
        .slice(0, 10) // Limiter à 10 missions pour éviter les messages trop longs
        .map(mission => `- ${mission.title} (${mission.dailyRateMin}€ - ${mission.dailyRateMax}€/jour)`)
        .join('\n');

      await interaction.reply({
        content: `**Missions disponibles :**\n${missionsList}`,
        ephemeral: true
      });
    } catch (error) {
      console.error('Erreur lors de la récupération des missions:', error);
      await interaction.reply({
        content: 'Une erreur est survenue lors de la récupération des missions.',
        ephemeral: true
      });
    }
  }

  @Command({
    name: 'mission',
    description: 'Détails d\'une mission',
    options: [
      {
        name: 'id',
        description: 'ID de la mission',
        type: ApplicationCommandOptionType.String,
        required: true
      }
    ]
  })
  async getMission(interaction: CommandInteraction) {
    if (!interaction.isChatInputCommand()) return;

    const id = interaction.options.getString('id', true);
    
    try {
      const mission = await this.missionService.findOne(id);
      
      if (!mission) {
        await interaction.reply({
          content: 'Mission non trouvée.',
          ephemeral: true
        });
        return;
      }

      const missionDetails = [
        `**${mission.title}**`,
        `📝 ${mission.description}`,
        `💰 TJM : ${mission.dailyRateMin}€ - ${mission.dailyRateMax}€`,
        `📍 Localisation : ${mission.location}`,
        `🛠️ Compétences : ${mission.skills.map(skill => skill.name).join(', ')}`,
        mission.startDate ? `📅 Début : ${mission.startDate.toLocaleDateString()}` : null,
        mission.endDate ? `📅 Fin : ${mission.endDate.toLocaleDateString()}` : null
      ].filter(Boolean).join('\n');

      await interaction.reply({
        content: missionDetails,
        ephemeral: true
      });
    } catch (error) {
      console.error('Erreur lors de la récupération de la mission:', error);
      await interaction.reply({
        content: 'Une erreur est survenue lors de la récupération de la mission.',
        ephemeral: true
      });
    }
  }
}