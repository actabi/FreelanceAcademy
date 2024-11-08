// src/bot/decorators/command.decorator.ts
import { SetMetadata } from '@nestjs/common';
import { ApplicationCommandOptionType } from 'discord.js';

export interface CommandOption {
  name: string;
  description: string;
  type?: ApplicationCommandOptionType;
  required?: boolean;
  choices?: { name: string; value: string | number }[];
}

export interface CommandMetadata {
  name: string;
  description: string;
  options?: CommandOption[];
}

export const COMMAND_KEY = 'command';

export function Command(metadata: CommandMetadata) {
  return SetMetadata(COMMAND_KEY, metadata);
}