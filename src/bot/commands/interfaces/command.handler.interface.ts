// src/bot/commands/interfaces/command.handler.interface.ts
import { CommandInteraction } from 'discord.js';

export interface ICommandHandler {
  execute(interaction: CommandInteraction): Promise<void>;
}