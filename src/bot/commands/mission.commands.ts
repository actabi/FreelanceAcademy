// src/bot/commands/mission.commands.ts
import { Injectable } from '@nestjs/common';
import { CommandInteraction, ApplicationCommandOptionType } from 'discord.js';
import { Command } from '../decorators/command.decorator';
import { MissionService } from '../../core/services/mission.service';
import { Logger } from '@nestjs/common';

@Injectable()
export class MissionCommands {
  private readonly logger = new Logger(MissionCommands.name);
  
  constructor(private readonly missionService: MissionService) {}

  @Command({
    name: 'missions',
    description: 'Liste des missions disponibles'
  })
  async listMissions(interaction: CommandInteraction) {
    this.logger.debug('Executing listMissions command');
    
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
        .slice(0, 10)
        .map(mission => `- ${mission.title} (${mission.dailyRateMin}€ - ${mission.dailyRateMax}€/jour)`)
        .join('\n');

      await interaction.reply({
        content: `**Missions disponibles :**\n${missionsList}`,
        ephemeral: true
      });
    } catch (error) {
      this.logger.error('Error executing listMissions command:', error);
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
    this.logger.debug('Executing getMission command');
    
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
      this.logger.error('Error executing getMission command:', error);
      await interaction.reply({
        content: 'Une erreur est survenue lors de la récupération de la mission.',
        ephemeral: true
      });
    }
  }
}