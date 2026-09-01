import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('example')
export class Example {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', length: 255 })
  name!: string;

  @Column({ type: 'varchar', length: 255, name: 'col1' })
  col1!: string;

  @Column({ type: 'varchar', length: 255, name: 'col2' })
  col2!: string;

  @Column({ type: 'varchar', length: 255, name: 'col3' })
  col3!: string;

  @Column({ type: 'boolean', name: 'is_active', default: true })
  isActive!: boolean;

  @Column({ type: 'timestamptz', name: 'created_at', default: () => 'NOW()' })
  createdAt!: Date;

  @Column({ type: 'timestamptz', name: 'updated_at', nullable: true })
  updatedAt!: Date | null;
}
