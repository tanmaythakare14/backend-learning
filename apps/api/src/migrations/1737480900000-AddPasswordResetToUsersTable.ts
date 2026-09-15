import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Migration: AddPasswordResetToUsersTable
 * Dependencies: CreateUserTable
 *
 * Stores only a SHA-256 hash of the reset token, never the raw value — the
 * raw token only ever exists in the emailed link and briefly in memory while
 * AuthService issues it. A single active token per user (requesting a new
 * link overwrites the old one, which the app never treats as "still valid"
 * once overwritten).
 *
 * ⚠️ Write raw SQL only. Never use migration:generate.
 */
export class AddPasswordResetToUsersTable1737480900000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE users
        ADD COLUMN password_reset_token_hash VARCHAR(255),
        ADD COLUMN password_reset_expires_at TIMESTAMPTZ;
    `);

    await queryRunner.query(`
      CREATE INDEX idx_users_password_reset_token_hash ON users(password_reset_token_hash);
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX IF EXISTS idx_users_password_reset_token_hash;`);
    await queryRunner.query(`
      ALTER TABLE users
        DROP COLUMN IF EXISTS password_reset_token_hash,
        DROP COLUMN IF EXISTS password_reset_expires_at;
    `);
  }
}
