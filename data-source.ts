import { DataSource } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import * as dotenv from 'dotenv';
import { MissionEntity } from './src/infrastructure/database/entities/mission.entity';

dotenv.config();

export const AppDataSource = new DataSource({
  type: 'postgres',
  url: process.env.DATABASE_URL,
  entities: [MissionEntity],
  migrations: ['src/infrastructure/database/migrations/*.ts'],
  ssl: {
    rejectUnauthorized: false
  },
  synchronize: false,
  logging: true
});