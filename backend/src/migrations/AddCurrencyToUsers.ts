import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddCurrencyToUsers1700000000000 implements MigrationInterface {
  name = 'AddCurrencyToUsers1700000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE \`users\` 
      ADD COLUMN \`currency\` varchar(3) NOT NULL DEFAULT 'USD'
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE \`users\` 
      DROP COLUMN \`currency\`
    `);
  }
}
