import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';
import { Job } from './job.entity';

@Entity('job_logs')
export class JobLog {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ManyToOne(() => Job, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'job_id' })
  job!: Job;

  @Column({ type: 'varchar', length: 20 })
  status!: 'started' | 'completed' | 'failed';

  @Column({ type: 'text', nullable: true })
  message!: string;

  @CreateDateColumn()
  logged_at!: Date;
}
