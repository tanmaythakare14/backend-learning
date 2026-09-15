import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

export type CourseStatus = 'active' | 'deactivated' | 'deleted';

@Entity('course')
export class Course {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', length: 255 })
  name!: string;

  @Column({ type: 'text' })
  description!: string;

  @Column({ type: 'varchar', length: 2048, name: 'thumbnail_url' })
  thumbnailUrl!: string;

  @Column({ type: 'integer', name: 'total_learners', default: 0 })
  totalLearners!: number;

  @Column({ type: 'varchar', length: 20, default: 'active' })
  status!: CourseStatus;

  @Column({ type: 'timestamptz', name: 'enrolled_on', default: () => 'NOW()' })
  enrolledOn!: Date;

  @Column({ type: 'timestamptz', name: 'created_at', default: () => 'NOW()' })
  createdAt!: Date;

  @Column({ type: 'timestamptz', name: 'updated_at', nullable: true })
  updatedAt!: Date | null;
}
