import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

export type AssignmentKind = 'written' | 'quiz';
export type AssignmentStatus = 'active' | 'deleted';

@Entity('assignment')
export class Assignment {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', length: 10 })
  kind!: AssignmentKind;

  @Column({ type: 'varchar', length: 255 })
  title!: string;

  @Column({ type: 'uuid', name: 'course_id' })
  courseId!: string;

  @Column({ type: 'text' })
  instructions!: string;

  @Column({ type: 'timestamptz', name: 'due_at' })
  dueAt!: Date;

  @Column({ type: 'varchar', length: 20, default: 'active' })
  status!: AssignmentStatus;

  @Column({ type: 'timestamptz', name: 'created_at', default: () => 'NOW()' })
  createdAt!: Date;

  @Column({ type: 'timestamptz', name: 'updated_at', nullable: true })
  updatedAt!: Date | null;
}
