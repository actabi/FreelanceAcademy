// src/infrastructure/database/migrations/1699137600000-CreateMissionTable.ts
import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateMissionTable1699137600000 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE TYPE "mission_status_enum" AS ENUM ('DRAFT', 'PUBLISHED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED');

            CREATE TABLE "missions" (
                "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
                "title" VARCHAR NOT NULL,
                "description" TEXT NOT NULL,
                "status" mission_status_enum NOT NULL DEFAULT 'DRAFT',
                "dailyRateMin" DECIMAL(10,2) NOT NULL,
                "dailyRateMax" DECIMAL(10,2) NOT NULL,
                "startDate" TIMESTAMP,
                "endDate" TIMESTAMP,
                "skills" TEXT[],
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP NOT NULL DEFAULT now()
            );
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            DROP TABLE "missions";
            DROP TYPE "mission_status_enum";
        `);
    }
}