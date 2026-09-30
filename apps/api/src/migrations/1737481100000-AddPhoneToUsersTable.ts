import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Migration: AddPhoneToUsersTable
 * Dependencies: MigrateUsersToAuth0
 *
 * The Settings > User profile screen lets someone store a contact phone number.
 * Auth0 does not hold this — it is ours. Nullable, because every row that
 * already exists predates the field.
 *
 * ⚠️ Write raw SQL only. Never use migration:generate.
 */
export class AddPhoneToUsersTable1737481100000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE users
        ADD COLUMN IF NOT EXISTS phone VARCHAR(30);
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE users
        DROP COLUMN IF EXISTS phone;
    `);
  }
}
