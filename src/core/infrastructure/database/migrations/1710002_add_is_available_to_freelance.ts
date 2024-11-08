import { MigrationInterface, QueryRunner, TableColumn } from "typeorm";

export class AddIsAvailableToFreelance1710002 implements MigrationInterface {
    name = 'AddIsAvailableToFreelance1710002';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.addColumn(
            'freelance',
            new TableColumn({
                name: 'is_available',
                type: 'boolean',
                default: true
            })
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropColumn('freelance', 'is_available');
    }
}