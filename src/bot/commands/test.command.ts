// src/bot/commands/test.command.ts
import { Injectable } from '@nestjs/common';
import { CommandInteraction } from 'discord.js';
import { Command } from '../decorators/command.decorator';

@Injectable()
export class TestCommand {
  @Command({
    name: 'ping',
    description: 'Répond avec pong ! Vérifie si le bot fonctionne.'
  })
  async execute(interaction: CommandInteraction) {
    await interaction.reply({ 
      content: 'Pong ! 🏓\nLe bot est opérationnel !',
      ephemeral: true 
    });
  }
}