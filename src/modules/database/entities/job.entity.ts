import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

/**
 * Represents a scheduled job in the system.
 * Contains details about the job's execution schedule, status, and payload.
 */
@Entity('jobs')
export class Job {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 255 })
  name: string;

  @Column({ type: 'jsonb' })
  payload: any;

  @Column({ type: 'varchar', length: 20 })
  status: 'pending' | 'running' | 'completed' | 'failed';

  @Column({ type: 'timestamp' })
  scheduled_at: Date;

  @Column({ length: 50 })
  recurrence: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
