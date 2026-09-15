import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Migration: AddDeletedStatusToCourseTable
 * Dependencies: CreateCourseTable
 *
 * Course Management's UI grew a "Deleted Courses" tab, so DELETE /courses/:id
 * moves to a soft-delete (status='deleted', row stays queryable) instead of
 * removing the row — matching the student table's active/deactivated/deleted
 * pattern exactly.
 *
 * ⚠️ Write raw SQL only. Never use migration:generate.
 */
export class AddDeletedStatusToCourseTable1737480800000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE course DROP CONSTRAINT course_status_check;`);
    await queryRunner.query(`
      ALTER TABLE course
        ADD CONSTRAINT course_status_check CHECK (status IN ('active', 'deactivated', 'deleted'));
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      UPDATE course SET status = 'deactivated' WHERE status = 'deleted';
    `);
    await queryRunner.query(`ALTER TABLE course DROP CONSTRAINT course_status_check;`);
    await queryRunner.query(`
      ALTER TABLE course
        ADD CONSTRAINT course_status_check CHECK (status IN ('active', 'deactivated'));
    `);
  }
}
