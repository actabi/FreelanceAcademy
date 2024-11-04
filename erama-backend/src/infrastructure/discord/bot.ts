import { Injectable, OnModuleInit } from '@nestjs/common';
import { Client, GatewayIntentBits } from 'discord.js';

@Injectable()
export class DiscordBot implements OnModuleInit {
  private client: Client;

  constructor() {
    this.client = new Client({
      intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages
      ]
    });
  }

  async onModuleInit() {
    if (process.env.DISCORD_TOKEN) {
      await this.client.login(process.env.DISCORD_TOKEN);
      console.log('Discord bot is connected!');
    }
  }
}