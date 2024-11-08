// src/app.module.ts
import { DiscordClient } from "./bot/discord.client";
import { NotificationService } from "./core/services/notification.service";
import { MissionService } from "./core/services/mission.service";
import { FreelanceService } from "./core/services/freelance.service";
import { MatchingService } from "./core/services/matching.service";
import { Module } from "@nestjs/common";
import { MissionEntity } from "./core/domain/entities/mission.entity";
import { FreelanceEntity } from "./core/domain/entities/freelance.entity";
import { SkillEntity } from "./core/domain/entities/skill.entity";
import { ApplicationEntity } from "./core/domain/entities/application.entity";
import { AlertEntity } from "./core/domain/entities/alert.entity";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { HealthController } from "./api/controllers/health.controller";
import { RedisService } from "./core/services/redis.service";
import { CacheService } from "./core/services/cache.service";
import { AlertService } from "./core/services/alert.service";
import { BotModule } from './bot/bot.module';
import { NotificationModule } from './core/notification/notification.module';

@Module({
  imports: [
    // Configuration globale
    ConfigModule.forRoot({
      isGlobal: true, // Rend la configuration accessible partout
      ignoreEnvFile: true,
    }),

    // Configuration TypeORM avec plus de robustesse
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: "postgres",
        url: process.env.DATABASE_URL,
        entities: [MissionEntity],
        synchronize: process.env.NODE_ENV === "development",
        ssl: {
          rejectUnauthorized: false,
        },
        // Configurations additionnelles pour la robustesse
        retryAttempts: 5,
        retryDelay: 3000,
        keepConnectionAlive: true,
        autoLoadEntities: true,
        logging: process.env.NODE_ENV === "development",
      }),
      inject: [ConfigService],
    }),

    TypeOrmModule.forFeature([
      MissionEntity,
      FreelanceEntity,
      SkillEntity,
      ApplicationEntity,
      AlertEntity
    ]),
    BotModule,
    NotificationModule,
  ],
  controllers: [
    HealthController, // Pour monitorer l'état de l'application
  ],
  providers: [
    {
      provide: "IDiscordService",
      useClass: DiscordClient,
    },
    RedisService,
    NotificationService,
    MissionService,
    MissionService,
    FreelanceService,
    MatchingService,
    NotificationService,
    DiscordClient,
    CacheService,
    AlertService
    // Ajoutez ici vos autres services
  ],
  exports: [
    RedisService,
    MissionService,
    FreelanceService,
    MatchingService,
    NotificationService
    // Exportez les services qui seront utilisés dans d'autres modules
  ],
})
export class AppModule {}
