import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Migration: CreateUserTable
 * Dependencies: None (reuses the update_updated_at_column() trigger function
 * created by CreateExampleTable)
 *
 * ⚠️ Write raw SQL only. Never use migration:generate.
 */
export class CreateUserTable1737480300000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE users (
        id             UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        first_name     VARCHAR(255) NOT NULL,
        last_name      VARCHAR(255) NOT NULL,
        email          VARCHAR(255) NOT NULL,
        password_hash  VARCHAR(255) NOT NULL,
        is_active      BOOLEAN NOT NULL DEFAULT true,
        created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at     TIMESTAMPTZ
      );
    `);

    await queryRunner.query(`CREATE UNIQUE INDEX idx_users_email ON users(email);`);
    await queryRunner.query(`CREATE INDEX idx_users_is_active ON users(is_active);`);

    await queryRunner.query(`
      CREATE TRIGGER users_updated_at_trigger
        BEFORE UPDATE ON users
        FOR EACH ROW
        EXECUTE FUNCTION update_updated_at_column();
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TRIGGER IF EXISTS users_updated_at_trigger ON users;`);
    await queryRunner.query(`DROP INDEX IF EXISTS idx_users_email;`);
    await queryRunner.query(`DROP INDEX IF EXISTS idx_users_is_active;`);
    await queryRunner.query(`DROP TABLE IF EXISTS users;`);
  }
}
