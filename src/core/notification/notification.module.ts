import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { NotificationService } from '../services/notification.service';
import { CacheService } from '../services/cache.service';
import { DiscordClient } from '../../bot/discord.client';
import { RedisModule } from '../redis/redis.module';

@Module({
  imports: [
    ConfigModule,
    RedisModule
  ],
  providers: [
    NotificationService,
    CacheService,
    DiscordClient
  ],
  exports: [
    NotificationService,
    CacheService
  ]
})
export class NotificationModule {}