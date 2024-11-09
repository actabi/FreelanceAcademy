import { DataSource } from "typeorm";
import { MissionEntity } from "./src/core/domain/entities/mission.entity";
import { FreelanceEntity } from "./src/core/domain/entities/freelance.entity";
import { SkillEntity } from "./src/core/domain/entities/skill.entity";
import { ApplicationEntity } from "./src/core/domain/entities/application.entity";
import { AlertEntity } from "./src/core/domain/entities/alert.entity";
import { config } from 'dotenv';

// Charger les variables d'environnement
config();

export const AppDataSource = new DataSource({
    type: "postgres",
    url: process.env.DATABASE_URL + "?family=0",
    entities: [
        MissionEntity,
        FreelanceEntity,
        SkillEntity,
        ApplicationEntity,
        AlertEntity
    ],
    migrations: ["src/core/infrastructure/database/migrations/*.{ts,js}"],
    migrationsTableName: "migrations",
    ssl: {
        rejectUnauthorized: false
    },
    synchronize: false,
    logging: true
});

export default AppDataSource;