import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

export type QuizQuestionType = 'single' | 'multiple' | 'short' | 'descriptive';

@Entity('quiz_question')
export class QuizQuestion {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid', name: 'assignment_id' })
  assignmentId!: string;

  @Column({ type: 'smallint' })
  position!: number;

  @Column({ type: 'varchar', length: 12 })
  type!: QuizQuestionType;

  @Column({ type: 'text' })
  prompt!: string;
}
