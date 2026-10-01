import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Migration: CreateChatTables
 * Dependencies: CreateStudentTable (conversation.student_id FK), CreateExampleTable
 * (reuses the update_updated_at_column() trigger function)
 *
 * One conversation per student (idx_conversation_student_id is UNIQUE) — this
 * app has no separate student-facing client, so "starting a new chat" always
 * means "open or create the one thread with this student," never a second
 * parallel thread with the same person.
 *
 * ⚠️ Write raw SQL only. Never use migration:generate.
 */
export class CreateChatTables1737480600000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE conversation (
        id                 UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        student_id         UUID NOT NULL REFERENCES student(id) ON DELETE CASCADE,
        admin_unread_count INTEGER NOT NULL DEFAULT 0,
        created_at         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at         TIMESTAMPTZ
      );
    `);

    await queryRunner.query(
      `CREATE UNIQUE INDEX idx_conversation_student_id ON conversation(student_id);`,
    );

    await queryRunner.query(`
      CREATE TRIGGER conversation_updated_at_trigger
        BEFORE UPDATE ON conversation
        FOR EACH ROW
        EXECUTE FUNCTION update_updated_at_column();
    `);

    await queryRunner.query(`
      CREATE TABLE message (
        id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        conversation_id UUID NOT NULL REFERENCES conversation(id) ON DELETE CASCADE,
        sender          VARCHAR(10) NOT NULL CHECK (sender IN ('admin', 'student')),
        text            TEXT,
        attachments     JSONB NOT NULL DEFAULT '[]',
        sent_at         TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `);

    await queryRunner.query(
      `CREATE INDEX idx_message_conversation_id ON message(conversation_id);`,
    );
    await queryRunner.query(`CREATE INDEX idx_message_sent_at ON message(sent_at);`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX IF EXISTS idx_message_sent_at;`);
    await queryRunner.query(`DROP INDEX IF EXISTS idx_message_conversation_id;`);
    await queryRunner.query(`DROP TABLE IF EXISTS message;`);
    await queryRunner.query(
      `DROP TRIGGER IF EXISTS conversation_updated_at_trigger ON conversation;`,
    );
    await queryRunner.query(`DROP INDEX IF EXISTS idx_conversation_student_id;`);
    await queryRunner.query(`DROP TABLE IF EXISTS conversation;`);
  }
}
