import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('quiz_option')
export class QuizOption {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid', name: 'question_id' })
  questionId!: string;

  @Column({ type: 'smallint' })
  position!: number;

  @Column({ type: 'varchar', length: 500 })
  label!: string;

  /** The answer key. Never copy this into a response a student can see before the reveal. */
  @Column({ type: 'boolean', name: 'is_correct', default: false })
  isCorrect!: boolean;
}
