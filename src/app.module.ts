import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MissionEntity } from './infrastructure/database/entities/mission.entity';

@Module({
  imports: [
    ConfigModule.forRoot(),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        url: configService.get('DATABASE_URL'),
        entities: [MissionEntity],
        synchronize: false, // à true seulement en développement
        ssl: {
          rejectUnauthorized: false // Nécessaire pour Railway
        }
      }),
      inject: [ConfigService],
    }),
  ],
})
export class AppModule {}