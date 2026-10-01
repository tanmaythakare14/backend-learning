import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Migration: CreateAssignmentTables
 * Dependencies: CreateCourseTable (assignment.course_id), CreateStudentTable
 * (submission/quiz_attempt.student_id), CreateExampleTable (reuses the
 * update_updated_at_column() trigger function)
 *
 * - assignment: a piece of work for a course — either `written` or a `quiz`.
 * - quiz_question / quiz_option: a quiz's questions. `quiz_option.is_correct` IS
 *   the answer key, so it must never be selected into a student-facing response.
 * - submission: a student's written hand-in. One row per (assignment, student);
 *   resubmitting overwrites it.
 * - quiz_attempt: a student's quiz answers and choice-question score. One row per
 *   (assignment, student) — the UNIQUE constraint is what enforces "one attempt",
 *   so it holds even if two requests race.
 *
 * ⚠️ Write raw SQL only. Never use migration:generate.
 */
export class CreateAssignmentTables1737481200000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE assignment (
        id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        kind         VARCHAR(10) NOT NULL CHECK (kind IN ('written', 'quiz')),
        title        VARCHAR(255) NOT NULL,
        course_id    UUID NOT NULL REFERENCES course(id) ON DELETE CASCADE,
        instructions TEXT NOT NULL,
        due_at       TIMESTAMPTZ NOT NULL,
        status       VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'deleted')),
        created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at   TIMESTAMPTZ
      );
    `);
    await queryRunner.query(`CREATE INDEX idx_assignment_course_id ON assignment(course_id);`);
    await queryRunner.query(`CREATE INDEX idx_assignment_status ON assignment(status);`);
    await queryRunner.query(`
      CREATE TRIGGER assignment_updated_at_trigger
        BEFORE UPDATE ON assignment
        FOR EACH ROW
        EXECUTE FUNCTION update_updated_at_column();
    `);

    await queryRunner.query(`
      CREATE TABLE quiz_question (
        id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        assignment_id UUID NOT NULL REFERENCES assignment(id) ON DELETE CASCADE,
        position      SMALLINT NOT NULL,
        type          VARCHAR(12) NOT NULL CHECK (type IN ('single', 'multiple', 'descriptive')),
        prompt        TEXT NOT NULL,
        UNIQUE (assignment_id, position)
      );
    `);

    await queryRunner.query(`
      CREATE TABLE quiz_option (
        id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        question_id UUID NOT NULL REFERENCES quiz_question(id) ON DELETE CASCADE,
        position    SMALLINT NOT NULL,
        label       VARCHAR(500) NOT NULL,
        is_correct  BOOLEAN NOT NULL DEFAULT FALSE,
        UNIQUE (question_id, position)
      );
    `);

    await queryRunner.query(`
      CREATE TABLE submission (
        id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        assignment_id UUID NOT NULL REFERENCES assignment(id) ON DELETE CASCADE,
        student_id    UUID NOT NULL REFERENCES student(id) ON DELETE CASCADE,
        answer_text   TEXT,
        file_name     VARCHAR(255),
        file_path     VARCHAR(500),
        file_size     INTEGER,
        mime_type     VARCHAR(255),
        submitted_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        is_late       BOOLEAN NOT NULL DEFAULT FALSE,
        UNIQUE (assignment_id, student_id),
        CHECK (answer_text IS NOT NULL OR file_path IS NOT NULL)
      );
    `);
    await queryRunner.query(`CREATE INDEX idx_submission_student_id ON submission(student_id);`);

    await queryRunner.query(`
      CREATE TABLE quiz_attempt (
        id             UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        assignment_id  UUID NOT NULL REFERENCES assignment(id) ON DELETE CASCADE,
        student_id     UUID NOT NULL REFERENCES student(id) ON DELETE CASCADE,
        answers        JSONB NOT NULL,
        choice_correct SMALLINT NOT NULL,
        choice_total   SMALLINT NOT NULL,
        review_status  VARCHAR(10) NOT NULL DEFAULT 'pending' CHECK (review_status IN ('pending', 'graded')),
        submitted_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        is_late        BOOLEAN NOT NULL DEFAULT FALSE,
        UNIQUE (assignment_id, student_id)
      );
    `);
    await queryRunner.query(
      `CREATE INDEX idx_quiz_attempt_student_id ON quiz_attempt(student_id);`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX IF EXISTS idx_quiz_attempt_student_id;`);
    await queryRunner.query(`DROP TABLE IF EXISTS quiz_attempt;`);
    await queryRunner.query(`DROP INDEX IF EXISTS idx_submission_student_id;`);
    await queryRunner.query(`DROP TABLE IF EXISTS submission;`);
    await queryRunner.query(`DROP TABLE IF EXISTS quiz_option;`);
    await queryRunner.query(`DROP TABLE IF EXISTS quiz_question;`);
    await queryRunner.query(`DROP TRIGGER IF EXISTS assignment_updated_at_trigger ON assignment;`);
    await queryRunner.query(`DROP INDEX IF EXISTS idx_assignment_status;`);
    await queryRunner.query(`DROP INDEX IF EXISTS idx_assignment_course_id;`);
    await queryRunner.query(`DROP TABLE IF EXISTS assignment;`);
  }
}
