// src/core/notification/notification.module.ts

import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { NotificationService } from '../services/notification.service';
import { CacheService } from '../services/cache.service';
import { DiscordClient } from '../../bot/discord.client';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true // Rend la configuration accessible partout
    })
  ],
  providers: [
    NotificationService,
    CacheService,
    DiscordClient
  ],
  exports: [NotificationService] // Exporte le service pour qu'il soit utilisable ailleurs
})
export class NotificationModule {}