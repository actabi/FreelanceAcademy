// src/bot/commands/alert.command.ts
import { Injectable } from '@nestjs/common';
import { CommandInteraction, EmbedBuilder } from 'discord.js';
import { ICommandHandler } from './interfaces/command.handler.interface';
import { AlertService } from '../../core/services/alert.service';

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
