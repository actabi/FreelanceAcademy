import { DataSource, DataSourceOptions } from 'typeorm';
import * as dotenv from 'dotenv';
import { MissionEntity } from '../../../domain/entities/mission.entity';
import { SkillEntity } from '../../../domain/entities/skill.entity';
import { FreelanceEntity } from '../../../domain/entities/freelance.entity';
import { ApplicationEntity } from '../../../domain/entities/application.entity';
import { AlertEntity } from '../../../domain/entities/alert.entity';

dotenv.config();

const options: DataSourceOptions = {
    type: 'postgres',
    url: process.env.DATABASE_URL_LOCAL + "?family=0",
    entities: [
        MissionEntity,
        SkillEntity,
        FreelanceEntity,
        ApplicationEntity,
        AlertEntity
    ],
    migrations: ['src/core/infrastructure/database/migrations/*.ts'],
    ssl: process.env.NODE_ENV === 'production' ? {
        rejectUnauthorized: false
    } : false,
    synchronize: false,
    logging: true,
    migrationsRun: true,
    extra: {
        // Ajout des extensions nécessaires pour PostgreSQL
        extensions: ['uuid-ossp']
    }
};

export const AppDataSource = new DataSource(options);