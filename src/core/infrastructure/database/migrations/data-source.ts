// src/core/infrastructure/database/migrations\data-source.ts
import { DataSource, DataSourceOptions } from 'typeorm';
import * as dotenv from 'dotenv';
import { MissionEntity } from '../../../domain/entities/mission.entity';
import { SkillEntity } from '../../../domain/entities/skill.entity';

dotenv.config();

const options: DataSourceOptions = {
    type: 'postgres',
    url: process.env.DATABASE_URL_LOCAL + "?family=0",
    entities: [MissionEntity, SkillEntity ],
    migrations: ['src/core/infrastructure/database/migrations/*.ts'],
    ssl: process.env.NODE_ENV === 'production' ? {
        rejectUnauthorized: false
    } : false,
    synchronize: false,
    logging: true,
    migrationsRun: true,
};

export const AppDataSource = new DataSource(options);