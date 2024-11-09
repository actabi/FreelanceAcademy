// src\core\infrastructure\database\migrations\1710003_add_missing_fields.ts

import { MigrationInterface, QueryRunner, TableColumn, TableIndex } from "typeorm";
import { MissionPriority, MissionVisibility } from "../../../domain/enums/mission.enums";

export class AddMissingFields1710003 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        // Add missing fields to FREELANCE table
        await queryRunner.addColumns("freelance", [
            new TableColumn({
                name: "experience_years",
                type: "integer",
                isNullable: true
            }),
            new TableColumn({
                name: "preferred_locations",
                type: "varchar[]",
                isNullable: true
            })
        ]);

        // Add missing fields to MISSION table
        await queryRunner.addColumns("mission", [
            new TableColumn({
                name: "priority",
                type: "enum",
                enum: Object.values(MissionPriority),
                isNullable: true
            }),
            new TableColumn({
                name: "visibility",
                type: "enum",
                enum: Object.values(MissionVisibility),
                default: "'DRAFT'"
            }),
            new TableColumn({
                name: "required_years_of_experience",
                type: "integer",
                isNullable: true
            }),
            new TableColumn({
                name: "estimated_duration",
                type: "integer",
                isNullable: true,
                comment: "Duration in days"
            }),
            new TableColumn({
                name: "max_applications",
                type: "integer",
                isNullable: true
            })
        ]);

        // Add missing indexes
        await queryRunner.createIndex("mission", new TableIndex({
            name: "idx_mission_priority",
            columnNames: ["priority"],
            isUnique: false
        }));

        await queryRunner.createIndex("mission", new TableIndex({
            name: "idx_mission_visibility",
            columnNames: ["visibility"],
            isUnique: false
        }));
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Remove indexes
        await queryRunner.dropIndex("mission", "idx_mission_priority");
        await queryRunner.dropIndex("mission", "idx_mission_visibility");

        // Remove columns from MISSION table
        await queryRunner.dropColumn("mission", "max_applications");
        await queryRunner.dropColumn("mission", "estimated_duration");
        await queryRunner.dropColumn("mission", "required_years_of_experience");
        await queryRunner.dropColumn("mission", "visibility");
        await queryRunner.dropColumn("mission", "priority");

        // Remove columns from FREELANCE table
        await queryRunner.dropColumn("freelance", "preferred_locations");
        await queryRunner.dropColumn("freelance", "experience_years");
    }
}