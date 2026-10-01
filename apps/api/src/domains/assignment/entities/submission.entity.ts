import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('submission')
export class Submission {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid', name: 'assignment_id' })
  assignmentId!: string;

  @Column({ type: 'uuid', name: 'student_id' })
  studentId!: string;

  @Column({ type: 'text', name: 'answer_text', nullable: true })
  answerText!: string | null;

  @Column({ type: 'varchar', length: 255, name: 'file_name', nullable: true })
  fileName!: string | null;

  /** Name of the stored file on disk. Private — there is deliberately no public route to it. */
  @Column({ type: 'varchar', length: 500, name: 'file_path', nullable: true })
  filePath!: string | null;

  @Column({ type: 'integer', name: 'file_size', nullable: true })
  fileSize!: number | null;

  @Column({ type: 'varchar', length: 255, name: 'mime_type', nullable: true })
  mimeType!: string | null;

  @Column({ type: 'timestamptz', name: 'submitted_at', default: () => 'NOW()' })
  submittedAt!: Date;

  @Column({ type: 'boolean', name: 'is_late', default: false })
  isLate!: boolean;
}
