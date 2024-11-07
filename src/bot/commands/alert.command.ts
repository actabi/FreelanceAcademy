// src/bot/commands/alert.command.ts
import { Injectable } from '@nestjs/common';
import { CommandInteraction, EmbedBuilder } from 'discord.js';
import { AlertService } from '../../core/services/alert.service';
import { ICommandHandler } from './interfaces/command.handler.interface';


// Command decorator
import { SetMetadata } from '@nestjs/common';

export function Command(options: { name: string, description: string, options?: any[] }) {
  return SetMetadata('command', options);
}

@Injectable()
export class AlertCommand implements ICommandHandler {
  constructor(private readonly alertService: AlertService) {}

  async execute(interaction: CommandInteraction): Promise<void> {
    const subcommand = interaction.options.getSubcommand();
    
    switch (subcommand) {
      case 'add':
        await this.addAlert(interaction);
        break;
      case 'list':
        await this.listAlerts(interaction);
        break;
      case 'remove':
        await this.removeAlert(interaction);
        break;
      default:
        await interaction.reply({ content: 'Commande invalide', ephemeral: true });
    }
  }

  private async addAlert(interaction: CommandInteraction): Promise<void> {
    const skills = interaction.options.getString('skills')?.split(',').map(s => s.trim()) || [];
    const minRate = interaction.options.getNumber('min_rate') || 0;
    const maxRate = interaction.options.getNumber('max_rate') || 9999;
    
    await this.alertService.createAlert({
      userId: interaction.user.id,
      skills,
      minRate,
      maxRate
    });

    await interaction.reply({ 
      content: 'Alerte créée avec succès !',
      ephemeral: true 
    });
  }

  private async listAlerts(interaction: CommandInteraction): Promise<void> {
    const alerts = await this.alertService.getAlertsByUserId(interaction.user.id);
    
    if (alerts.length === 0) {
      await interaction.reply({
        content: 'Vous n\'avez aucune alerte configurée.',
        ephemeral: true
      });
      return;
    }

    const embed = new EmbedBuilder()
      .setTitle('Vos Alertes')
      .setColor('#0099ff');

    alerts.forEach((alert, index) => {
      embed.addFields({
        name: `Alerte #${index + 1}`,
        value: `Compétences: ${alert.skills.join(', ')}\nTJM: ${alert.minRate}€ - ${alert.maxRate}€`
      });
    });

    await interaction.reply({ embeds: [embed], ephemeral: true });
  }

  private async removeAlert(interaction: CommandInteraction): Promise<void> {
    const alertId = interaction.options.getString('id', true);
    await this.alertService.deleteAlert(alertId);
    
    await interaction.reply({
      content: 'Alerte supprimée avec succès !',
      ephemeral: true
    });
  }
}

// Mission commands
@Injectable()
export class MissionCommands {
  constructor(private missionService: MissionService) {}

  @Command({
    name: 'missions',
    description: 'Liste des missions disponibles'
  })
  async listMissions(interaction: CommandInteraction) {
    const missions = await this.missionService.findAll();
    // Handle response
  }

  @Command({
    name: 'mission',
    description: 'Détails d\'une mission',
    options: [{
      name: 'id',
      description: 'ID de la mission',
      type: 'STRING',
      required: true
    }]
  })
  async getMission(interaction: CommandInteraction) {
    if (!interaction.isChatInputCommand()) return;
    
    const id = interaction.options.getString('id', true);
    const mission = await this.missionService.findOne(id);
    // Handle response
  }
}

// Profile command
@Injectable()
export class ProfileCommand {
  constructor(private readonly freelanceService: FreelanceService) {}

  async execute(interaction: CommandInteraction) {
    if (!interaction.isChatInputCommand()) return;

    const subcommand = interaction.options.getSubcommand(true);
    
    switch (subcommand) {
      case 'view':
        await this.viewProfile(interaction);
        break;
      case 'edit':
        await this.editProfile(interaction);
        break;
      default:
        await interaction.reply({ content: 'Commande invalide', ephemeral: true });
    }
  }
}