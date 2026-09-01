import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Migration: CreateExampleTable
 * Dependencies: role
 *
 * ⚠️ Write raw SQL only. Never use migration:generate.
 */
export class CreateExampleTable1737480200000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE example (
        id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        name        VARCHAR(255) NOT NULL,
        col1        VARCHAR(255) NOT NULL,
        col2        VARCHAR(255) NOT NULL,
        col3        VARCHAR(255) NOT NULL,
        is_active   BOOLEAN NOT NULL DEFAULT true,
        created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at  TIMESTAMPTZ
      );
    `);

    await queryRunner.query(`CREATE INDEX idx_example_is_active ON example(is_active);`);

    await queryRunner.query(`
      CREATE OR REPLACE FUNCTION update_updated_at_column()
      RETURNS TRIGGER AS $$
      BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
      $$ language 'plpgsql';
    `);

    await queryRunner.query(`
      CREATE TRIGGER example_updated_at_trigger
        BEFORE UPDATE ON example
        FOR EACH ROW
        EXECUTE FUNCTION update_updated_at_column();
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TRIGGER IF EXISTS example_updated_at_trigger ON example;`);
    await queryRunner.query(`DROP INDEX IF EXISTS idx_example_is_active;`);
    await queryRunner.query(`DROP TABLE IF EXISTS example;`);
  }
}
