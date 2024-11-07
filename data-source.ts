// data-source.ts
import { DataSource, DataSourceOptions } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import * as dotenv from 'dotenv';
import { MissionEntity } from './src/infrastructure/database/entities/mission.entity';

dotenv.config();

const options: DataSourceOptions = {
    type: 'postgres',
    url: process.env.DATABASE_URL,
    entities: [MissionEntity],
    migrations: ['src/infrastructure/database/migrations/*.ts'],
    ssl: process.env.DATABASE_URL?.includes('localhost') ? false : {
        rejectUnauthorized: false
    },
    synchronize: false,
    logging: true,
    migrationsRun: true,
};

export const AppDataSource = new DataSource(options);

// Gestion des erreurs d'initialisation
AppDataSource.initialize()
    .then(() => {
        console.log('Data Source has been initialized!');
    })
    .catch((err) => {
        console.error('Error during Data Source initialization:', err);
    });