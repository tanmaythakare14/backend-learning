import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Migration: CreateStudentTable
 * Dependencies: None (reuses the update_updated_at_column() trigger function
 * created by CreateExampleTable)
 *
 * ⚠️ Write raw SQL only. Never use migration:generate.
 */
export class CreateStudentTable1737480400000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE student (
        id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        student_id   VARCHAR(20) NOT NULL,
        first_name   VARCHAR(255) NOT NULL,
        last_name    VARCHAR(255) NOT NULL,
        email        VARCHAR(255) NOT NULL,
        phone        VARCHAR(30) NOT NULL,
        course       VARCHAR(255) NOT NULL,
        status       VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'deactivated', 'deleted')),
        assigned_on  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at   TIMESTAMPTZ
      );
    `);

    await queryRunner.query(`CREATE UNIQUE INDEX idx_student_student_id ON student(student_id);`);
    await queryRunner.query(`CREATE UNIQUE INDEX idx_student_email ON student(email);`);
    await queryRunner.query(`CREATE INDEX idx_student_status ON student(status);`);

    await queryRunner.query(`
      CREATE TRIGGER student_updated_at_trigger
        BEFORE UPDATE ON student
        FOR EACH ROW
        EXECUTE FUNCTION update_updated_at_column();
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TRIGGER IF EXISTS student_updated_at_trigger ON student;`);
    await queryRunner.query(`DROP INDEX IF EXISTS idx_student_student_id;`);
    await queryRunner.query(`DROP INDEX IF EXISTS idx_student_email;`);
    await queryRunner.query(`DROP INDEX IF EXISTS idx_student_status;`);
    await queryRunner.query(`DROP TABLE IF EXISTS student;`);
  }
}
