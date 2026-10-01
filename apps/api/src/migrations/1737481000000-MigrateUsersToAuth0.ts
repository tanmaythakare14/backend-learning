import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Migration: MigrateUsersToAuth0
 * Dependencies: CreateUserTable, AddPasswordResetToUsersTable
 *
 * Auth0 becomes the sole identity provider — this app no longer stores
 * passwords or issues its own reset tokens. `users` becomes a profile table
 * keyed by Auth0's stable subject claim (`sub`, e.g. "auth0|..." or
 * "google-oauth2|..."), populated via just-in-time provisioning on first
 * authenticated request.
 *
 * ⚠️ Write raw SQL only. Never use migration:generate.
 */
export class MigrateUsersToAuth01737481000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX IF EXISTS idx_users_password_reset_token_hash;`);
    await queryRunner.query(`DROP INDEX IF EXISTS idx_users_email;`);

    await queryRunner.query(`
      ALTER TABLE users
        DROP COLUMN IF EXISTS password_hash,
        DROP COLUMN IF EXISTS password_reset_token_hash,
        DROP COLUMN IF EXISTS password_reset_expires_at,
        ADD COLUMN auth0_sub VARCHAR(255);
    `);

    await queryRunner.query(`CREATE UNIQUE INDEX idx_users_auth0_sub ON users(auth0_sub);`);
    await queryRunner.query(`CREATE UNIQUE INDEX idx_users_email ON users(email);`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX IF EXISTS idx_users_auth0_sub;`);
    await queryRunner.query(`DROP INDEX IF EXISTS idx_users_email;`);

    await queryRunner.query(`
      ALTER TABLE users
        DROP COLUMN IF EXISTS auth0_sub,
        ADD COLUMN password_hash VARCHAR(255) NOT NULL DEFAULT '',
        ADD COLUMN password_reset_token_hash VARCHAR(255),
        ADD COLUMN password_reset_expires_at TIMESTAMPTZ;
    `);

    await queryRunner.query(`CREATE UNIQUE INDEX idx_users_email ON users(email);`);
    await queryRunner.query(`
      CREATE INDEX idx_users_password_reset_token_hash ON users(password_reset_token_hash);
    `);
  }
}
