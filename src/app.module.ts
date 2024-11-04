import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MissionEntity } from './infrastructure/database/entities/mission.entity';
import { RedisService } from './infrastructure/cache/redis.client';
import { HealthController } from './api/controllers/health.controller';

@Module({
  imports: [
    // Configuration globale
    ConfigModule.forRoot({
      isGlobal: true, // Rend la configuration accessible partout
    }),

    // Configuration TypeORM avec plus de robustesse
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        url: configService.get('DATABASE_URL'),
        entities: [MissionEntity],
        synchronize: configService.get('NODE_ENV') === 'development',
        ssl: {
          rejectUnauthorized: false
        },
        // Configurations additionnelles pour la robustesse
        retryAttempts: 5,
        retryDelay: 3000,
        keepConnectionAlive: true,
        autoLoadEntities: true,
        logging: configService.get('NODE_ENV') === 'development',
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [
    HealthController // Pour monitorer l'état de l'application
  ],
  providers: [
    RedisService,
    // Ajoutez ici vos autres services
  ],
  exports: [
    RedisService,
    // Exportez les services qui seront utilisés dans d'autres modules
  ],
})
export class AppModule {}