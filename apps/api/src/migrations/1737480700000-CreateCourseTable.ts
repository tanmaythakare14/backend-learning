import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Migration: CreateCourseTable
 * Dependencies: CreateExampleTable (reuses the update_updated_at_column() trigger function)
 *
 * Originally just two statuses ('active' | 'deactivated') with a hard
 * DELETE — see AddDeletedStatusToCourseTable for the follow-up migration
 * that added a 'deleted' status once the UI grew a "Deleted Courses" tab.
 *
 * ⚠️ Write raw SQL only. Never use migration:generate.
 */
export class CreateCourseTable1737480700000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE course (
        id             UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        name           VARCHAR(255) NOT NULL,
        description    TEXT NOT NULL,
        thumbnail_url  VARCHAR(2048) NOT NULL,
        total_learners INTEGER NOT NULL DEFAULT 0,
        status         VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'deactivated')),
        enrolled_on    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at     TIMESTAMPTZ
      );
    `);

    await queryRunner.query(`CREATE INDEX idx_course_status ON course(status);`);

    await queryRunner.query(`
      CREATE TRIGGER course_updated_at_trigger
        BEFORE UPDATE ON course
        FOR EACH ROW
        EXECUTE FUNCTION update_updated_at_column();
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TRIGGER IF EXISTS course_updated_at_trigger ON course;`);
    await queryRunner.query(`DROP INDEX IF EXISTS idx_course_status;`);
    await queryRunner.query(`DROP TABLE IF EXISTS course;`);
  }
}
