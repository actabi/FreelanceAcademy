// src/bot/commands/profile.command.ts
import { Injectable } from '@nestjs/common';
import { CommandInteraction, EmbedBuilder } from 'discord.js';
import { ICommandHandler } from './interfaces/command.handler.interface';
import { FreelanceService } from '../../core/services/freelance.service';

@Injectable()
export class ProfileCommand implements ICommandHandler {
  constructor(private readonly freelanceService: FreelanceService) {}

  async execute(interaction: CommandInteraction): Promise<void> {
    const subcommand = interaction.options.getSubcommand();
    
    switch (subcommand) {
      case 'view':
        await this.viewProfile(interaction);
        break;
      case 'update':
        await this.updateProfile(interaction);
        break;
      default:
        await interaction.reply({ content: 'Commande invalide', ephemeral: true });
    }
  }

  private async viewProfile(interaction: CommandInteraction): Promise<void> {
    const profile = await this.freelanceService.getProfileByDiscordId(interaction.user.id);
    
    if (!profile) {
      await interaction.reply({ 
        content: 'Vous n\'avez pas encore de profil. Utilisez /profile update pour en créer un.',
        ephemeral: true 
      });
      return;
    }

    const embed = new EmbedBuilder()
      .setTitle('Votre Profil Freelance')
      .setColor('#0099ff')
      .addFields(
        { name: 'Nom', value: profile.name, inline: true },
        { name: 'TJM', value: `${profile.dailyRate}€`, inline: true },
        { name: 'Compétences', value: profile.skills.join(', ') || 'Aucune compétence renseignée' },
        { name: 'Disponibilité', value: profile.isAvailable ? '✅ Disponible' : '❌ Indisponible' }
      )
      .setTimestamp();

    await interaction.reply({ embeds: [embed], ephemeral: true });
  }

  private async updateProfile(interaction: CommandInteraction): Promise<void> {
    // Démarrer le processus de mise à jour via modal Discord
    const modal = this.createProfileModal();
    await interaction.showModal(modal);
  }
}