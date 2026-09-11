import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

export type StudentStatus = 'active' | 'deactivated' | 'deleted';

@Entity('student')
export class Student {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', length: 20, name: 'student_id' })
  studentId!: string;

  @Column({ type: 'varchar', length: 255, name: 'first_name' })
  firstName!: string;

  @Column({ type: 'varchar', length: 255, name: 'last_name' })
  lastName!: string;

  @Column({ type: 'varchar', length: 255 })
  email!: string;

  @Column({ type: 'varchar', length: 30 })
  phone!: string;

  @Column({ type: 'varchar', length: 255 })
  course!: string;

  @Column({ type: 'varchar', length: 255, name: 'street_address', nullable: true })
  streetAddress!: string | null;

  @Column({ type: 'varchar', length: 255, nullable: true })
  city!: string | null;

  @Column({ type: 'varchar', length: 255, nullable: true })
  state!: string | null;

  @Column({ type: 'varchar', length: 20, name: 'zip_code', nullable: true })
  zipCode!: string | null;

  @Column({ type: 'varchar', length: 255, nullable: true })
  country!: string | null;

  @Column({ type: 'varchar', length: 20, default: 'active' })
  status!: StudentStatus;

  @Column({ type: 'timestamptz', name: 'assigned_on', default: () => 'NOW()' })
  assignedOn!: Date;

  @Column({ type: 'timestamptz', name: 'created_at', default: () => 'NOW()' })
  createdAt!: Date;

  @Column({ type: 'timestamptz', name: 'updated_at', nullable: true })
  updatedAt!: Date | null;
}
