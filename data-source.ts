// // data-source.ts
// import { DataSource, DataSourceOptions } from 'typeorm';
// import * as dotenv from 'dotenv';
// import { MissionEntity } from './src/core/domain/entities/mission.entity';
// import { SkillEntity } from './src/core/domain/entities/skill.entity';

// dotenv.config();

// const getDatabaseUrl = () => {
//   // En développement, utilisez l'URL de la base de données locale
//   if (process.env.NODE_ENV === 'development') {
//     return process.env.DATABASE_URL_LOCAL;
//   }
//   // En production, utilisez l'URL Railway
//   return process.env.DATABASE_URL;
// };

// const options: DataSourceOptions = {
//     type: 'postgres',
//     url: getDatabaseUrl(),
//     entities: [MissionEntity, SkillEntity ],
//     migrations: ['src/core/infrastructure/database/migrations/*.ts'],
//     ssl: process.env.NODE_ENV === 'production' ? {
//         rejectUnauthorized: false
//     } : false,
//     synchronize: false,
//     logging: true,
//     migrationsRun: true,
// };

// export const AppDataSource = new DataSource(options);