// src/api/controllers/auth.controller.ts
import { Controller, Get, Query, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DiscordClient } from '../../bot/discord.client';

@Controller('auth')
export class AuthController {
  private readonly logger = new Logger(AuthController.name);

  constructor(
    private readonly configService: ConfigService,
    private readonly discordClient: DiscordClient
  ) {}

  @Get('discord/callback')
  async handleDiscordCallback(
    @Query('code') code: string,
    @Query('guild_id') guildId: string,
    @Query('permissions') permissions: string
  ) {
    this.logger.log({
      message: 'Bot installation callback received',
      guildId,
      permissions,
      botStatus: this.discordClient.getClient()?.isReady() ? 'ready' : 'not ready'
    });

    try {
      // Vérifier la connexion du bot
      await this.discordClient.getClient().guilds.fetch(guildId);
      
      this.logger.log(`Bot successfully connected to guild ${guildId}`);

      // Liste des commandes enregistrées
      const commands = await this.discordClient.getClient().application?.commands.fetch();
      this.logger.log(`Registered commands: ${commands?.size || 0}`);
      
      commands?.forEach(cmd => {
        this.logger.log(`Command registered: ${cmd.name}`);
      });

      return {
        success: true,
        message: 'Bot successfully installed',
        details: {
          guildId,
          commandsCount: commands?.size || 0,
          botConnected: true
        }
      };
    } catch (error) {
      this.logger.error('Error during bot installation verification:', error);
      throw error;
    }
  }
}