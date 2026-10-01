import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Migration: AllowShortQuestionType
 * Dependencies: CreateAssignmentTables
 *
 * The assignment builder gained a fourth question type, a one-line "short" written
 * answer. quiz_question.type was created with a CHECK that only allowed
 * single / multiple / descriptive, so inserting a short question would be rejected by the
 * database. This widens that constraint.
 *
 * down() puts the old three-type constraint back. It deliberately does NOT delete or
 * convert existing 'short' questions: if any exist, re-adding the constraint fails, which
 * protects the data rather than silently rewriting someone's quiz.
 *
 * ⚠️ Write raw SQL only. Never use migration:generate.
 */
export class AllowShortQuestionType1737481300000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE quiz_question DROP CONSTRAINT IF EXISTS quiz_question_type_check;`,
    );
    await queryRunner.query(`
      ALTER TABLE quiz_question
        ADD CONSTRAINT quiz_question_type_check
        CHECK (type IN ('single', 'multiple', 'short', 'descriptive'));
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE quiz_question DROP CONSTRAINT IF EXISTS quiz_question_type_check;`,
    );
    await queryRunner.query(`
      ALTER TABLE quiz_question
        ADD CONSTRAINT quiz_question_type_check
        CHECK (type IN ('single', 'multiple', 'descriptive'));
    `);
  }
}
