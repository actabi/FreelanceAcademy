// src/api/controllers/auth.controller.ts
import { Controller, Get, Query, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Controller('auth')
export class AuthController {
  private readonly logger = new Logger(AuthController.name);

  constructor(
    private readonly configService: ConfigService
  ) {}

  @Get('discord/callback')
  async handleDiscordCallback(
    @Query('code') code: string,
    @Query('guild_id') guildId: string,
    @Query('permissions') permissions: string
  ) {
    this.logger.log(`Discord callback received - Guild: ${guildId}, Code: ${code}`);

    return {
      success: true,
      message: 'Bot successfully installed'
    };
  }
}