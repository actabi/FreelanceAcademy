// src/core/infrastructure/database/migrations/1710001_create_base_tables.ts
import { MigrationInterface, QueryRunner, Table, TableIndex, TableForeignKey } from "typeorm";
import { MissionStatus, MissionLocation } from "../../../domain/interfaces/mission";

export class CreateBaseTables1710001 implements MigrationInterface {
    name = 'CreateBaseTables1710001';

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Table FREELANCE
        await queryRunner.createTable(new Table({
            name: "freelance",
            columns: [
                {
                    name: "id",
                    type: "uuid",
                    isPrimary: true,
                    default: "uuid_generate_v4()"
                },
                {
                    name: "discord_id",
                    type: "varchar",
                    isUnique: true
                },
                {
                    name: "name",
                    type: "varchar"
                },
                {
                    name: "email",
                    type: "varchar",
                    isNullable: true
                },
                {
                    name: "daily_rate",
                    type: "integer",
                    isNullable: true
                },
                {
                    name: "is_active",
                    type: "boolean",
                    default: true
                },
                {
                    name: "created_at",
                    type: "timestamp",
                    default: "now()"
                },
                {
                    name: "updated_at",
                    type: "timestamp",
                    default: "now()"
                }
            ]
        }), true);

        // Table MISSION
        await queryRunner.createTable(new Table({
            name: "mission",
            columns: [
                {
                    name: "id",
                    type: "uuid",
                    isPrimary: true,
                    default: "uuid_generate_v4()"
                },
                {
                    name: "title",
                    type: "varchar"
                },
                {
                    name: "description",
                    type: "text"
                },
                {
                    name: "status",
                    type: "enum",
                    enum: Object.values(MissionStatus),
                    default: `'${MissionStatus.DRAFT}'`
                },
                {
                    name: "daily_rate_min",
                    type: "integer"
                },
                {
                    name: "daily_rate_max",
                    type: "integer"
                },
                {
                    name: "start_date",
                    type: "timestamp",
                    isNullable: true
                },
                {
                    name: "end_date",
                    type: "timestamp",
                    isNullable: true
                },
                {
                    name: "location",
                    type: "enum",
                    enum: Object.values(MissionLocation)
                },
                {
                    name: "company_name",
                    type: "varchar",
                    isNullable: true
                },
                {
                    name: "address",
                    type: "varchar",
                    isNullable: true
                },
                {
                    name: "discord_message_id",
                    type: "varchar",
                    isNullable: true
                },
                {
                    name: "created_at",
                    type: "timestamp",
                    default: "now()"
                },
                {
                    name: "updated_at",
                    type: "timestamp",
                    default: "now()"
                }
            ]
        }), true);

        // Table SKILL
        await queryRunner.createTable(new Table({
            name: "skill",
            columns: [
                {
                    name: "id",
                    type: "uuid",
                    isPrimary: true,
                    default: "uuid_generate_v4()"
                },
                {
                    name: "name",
                    type: "varchar",
                    isUnique: true
                },
                {
                    name: "category",
                    type: "varchar",
                    isNullable: true
                }
            ]
        }), true);

        // Table MISSION_APPLICATION
        await queryRunner.createTable(new Table({
            name: "mission_application",
            columns: [
                {
                    name: "id",
                    type: "uuid",
                    isPrimary: true,
                    default: "uuid_generate_v4()"
                },
                {
                    name: "mission_id",
                    type: "uuid"
                },
                {
                    name: "freelance_id",
                    type: "uuid"
                },
                {
                    name: "status",
                    type: "varchar",
                    default: "'PENDING'"
                },
                {
                    name: "message",
                    type: "text",
                    isNullable: true
                },
                {
                    name: "expected_daily_rate",
                    type: "integer",
                    isNullable: true
                },
                {
                    name: "created_at",
                    type: "timestamp",
                    default: "now()"
                },
                {
                    name: "updated_at",
                    type: "timestamp",
                    default: "now()"
                }
            ]
        }), true);

        // Table FREELANCE_SKILL (relation N-N)
        await queryRunner.createTable(new Table({
            name: "freelance_skill",
            columns: [
                {
                    name: "freelance_id",
                    type: "uuid"
                },
                {
                    name: "skill_id",
                    type: "uuid"
                }
            ]
        }), true);

        // Table MISSION_SKILL (relation N-N)
        await queryRunner.createTable(new Table({
            name: "mission_skill",
            columns: [
                {
                    name: "mission_id",
                    type: "uuid"
                },
                {
                    name: "skill_id",
                    type: "uuid"
                }
            ]
        }), true);

        // Indexes
        await queryRunner.createIndex("freelance", new TableIndex({
            name: "idx_freelance_discord_id",
            columnNames: ["discord_id"]
        }));

        await queryRunner.createIndex("mission", new TableIndex({
            name: "idx_mission_status",
            columnNames: ["status"]
        }));

        await queryRunner.createIndex("mission", new TableIndex({
            name: "idx_mission_date",
            columnNames: ["start_date", "end_date"]
        }));

        await queryRunner.createIndex("mission_application", new TableIndex({
            name: "idx_application_status",
            columnNames: ["status"]
        }));

        // Foreign Keys
        await queryRunner.createForeignKey("mission_application", new TableForeignKey({
            name: "fk_application_mission",
            columnNames: ["mission_id"],
            referencedColumnNames: ["id"],
            referencedTableName: "mission",
            onDelete: "CASCADE"
        }));

        await queryRunner.createForeignKey("mission_application", new TableForeignKey({
            name: "fk_application_freelance",
            columnNames: ["freelance_id"],
            referencedColumnNames: ["id"],
            referencedTableName: "freelance",
            onDelete: "CASCADE"
        }));

        await queryRunner.createForeignKey("freelance_skill", new TableForeignKey({
            name: "fk_freelance_skill_freelance",
            columnNames: ["freelance_id"],
            referencedColumnNames: ["id"],
            referencedTableName: "freelance",
            onDelete: "CASCADE"
        }));

        await queryRunner.createForeignKey("freelance_skill", new TableForeignKey({
            name: "fk_freelance_skill_skill",
            columnNames: ["skill_id"],
            referencedColumnNames: ["id"],
            referencedTableName: "skill",
            onDelete: "CASCADE"
        }));

        await queryRunner.createForeignKey("mission_skill", new TableForeignKey({
            name: "fk_mission_skill_mission",
            columnNames: ["mission_id"],
            referencedColumnNames: ["id"],
            referencedTableName: "mission",
            onDelete: "CASCADE"
        }));

        await queryRunner.createForeignKey("mission_skill", new TableForeignKey({
            name: "fk_mission_skill_skill",
            columnNames: ["skill_id"],
            referencedColumnNames: ["id"],
            referencedTableName: "skill",
            onDelete: "CASCADE"
        }));
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Suppression des foreign keys
        await queryRunner.dropForeignKey("mission_skill", "fk_mission_skill_skill");
        await queryRunner.dropForeignKey("mission_skill", "fk_mission_skill_mission");
        await queryRunner.dropForeignKey("freelance_skill", "fk_freelance_skill_skill");
        await queryRunner.dropForeignKey("freelance_skill", "fk_freelance_skill_freelance");
        await queryRunner.dropForeignKey("mission_application", "fk_application_freelance");
        await queryRunner.dropForeignKey("mission_application", "fk_application_mission");

        // Suppression des indexes
        await queryRunner.dropIndex("mission_application", "idx_application_status");
        await queryRunner.dropIndex("mission", "idx_mission_date");
        await queryRunner.dropIndex("mission", "idx_mission_status");
        await queryRunner.dropIndex("freelance", "idx_freelance_discord_id");

        // Suppression des tables
        await queryRunner.dropTable("mission_skill");
        await queryRunner.dropTable("freelance_skill");
        await queryRunner.dropTable("mission_application");
        await queryRunner.dropTable("skill");
        await queryRunner.dropTable("mission");
        await queryRunner.dropTable("freelance");
    }
}