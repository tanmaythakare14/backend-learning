import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

export type ReviewStatus = 'pending' | 'graded';

export interface QuizAnswers {
  /** question id → chosen option ids */
  choices: Record<string, string[]>;
  /** question id → written answer */
  texts: Record<string, string>;
}

@Entity('quiz_attempt')
export class QuizAttempt {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid', name: 'assignment_id' })
  assignmentId!: string;

  @Column({ type: 'uuid', name: 'student_id' })
  studentId!: string;

  @Column({ type: 'jsonb' })
  answers!: QuizAnswers;

  @Column({ type: 'smallint', name: 'choice_correct' })
  choiceCorrect!: number;

  @Column({ type: 'smallint', name: 'choice_total' })
  choiceTotal!: number;

  @Column({ type: 'varchar', length: 10, name: 'review_status', default: 'pending' })
  reviewStatus!: ReviewStatus;

  @Column({ type: 'timestamptz', name: 'submitted_at', default: () => 'NOW()' })
  submittedAt!: Date;

  @Column({ type: 'boolean', name: 'is_late', default: false })
  isLate!: boolean;
}
