import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Job } from '../database/entities/job.entity';
import { JobLog } from '../database/entities/job-log.entity';
import { CreateJobDto } from './dtos/create-jobs.dto';
import { UpdateJobDto } from './dtos/update-jobs.dto';
import { v4 as uuidv4 } from 'uuid';
import { MailService } from '../mail/mail.service';
import { SchedulerService } from '../scheduler/scheduler.service';
import { MetricsService } from '../../common/metrics.service';

@Injectable()
export class JobService {
  /**
   * JobService constructor.
   * Injects repositories and services, and registers job processing callback.
   * @param jobRepository Repository for Job entity
   * @param jobLogRepository Repository for JobLog entity
   */
  constructor(
    @InjectRepository(Job)
    private readonly jobRepository: Repository<Job>,
    @InjectRepository(JobLog)
    private readonly jobLogRepository: Repository<JobLog>,
    private readonly mailService: MailService,
    private readonly schedulerService: SchedulerService,
    private readonly metricsService: MetricsService,
  ) {
    this.schedulerService.onJobDue((job) => {
      void this.processJob(job);
    });
  }

  /**
   * Creates and persists a new job.
   * No in-memory scheduling; polling will pick it up.
   *
   */
  async create(createJobDto: CreateJobDto): Promise<Job> {
    const job = this.jobRepository.create({
      ...createJobDto,
      id: uuidv4(),
      status: 'pending',
      scheduled_at: new Date(createJobDto.scheduled_at),
      recurrence: createJobDto.recurrence || 'none',
      created_at: new Date(),
      updated_at: new Date(),
    });
    const savedJob = await this.jobRepository.save(job);
    return savedJob;
  }

  /**
   * Finds and returns all jobs.
   * @returns Promise<Job[]> list of all jobs
   */
  async findAll(): Promise<Job[]> {
    return this.jobRepository.find();
  }

  /**
   * Finds a job by its ID.

   */
  async findOne(id: string): Promise<Job> {
    const job = await this.jobRepository.findOneBy({ id });
    if (!job) {
      throw new NotFoundException(`Job with ID ${id} not found`);
    }
    return job;
  }

  /**
   * Updates a job by its ID.
   *
   */
  async update(id: string, updateJobDto: UpdateJobDto): Promise<Job> {
    await this.jobRepository.update(id, {
      ...updateJobDto,
      status: updateJobDto.status as
        | 'pending'
        | 'running'
        | 'completed'
        | 'failed'
        | undefined,
      updated_at: new Date(),
    });
    return this.findOne(id);
  }

  /**
   * Removes a job by its ID.
   *
   */
  async remove(id: string): Promise<void> {
    const result = await this.jobRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Job with ID ${id} not found`);
    }
  }

  /**
   * Logs a job event with status and message.
   *
   */
  async logJob(jobId: string, status: string, message: string) {
    const job = await this.findOne(jobId);
    const jobLog = this.jobLogRepository.create({
      job,
      status: status as 'started' | 'completed' | 'failed',
      message,
      logged_at: new Date(),
    });
    await this.jobLogRepository.save(jobLog);
  }

  /**
   * Processes a job when it is due (called by polling mechanism).
   * Updates job status, logs events, sends notification emails, and reschedules if recurring.
   *
   */
  private async processJob(job: Job) {
    console.log('Processing job:', job.id, job.name);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      await this.update(job.id, {
        status: 'completed',
        last_executed_at: new Date().toISOString(),
        retry_count: 0,
        dead_lettered: false,
      });
      this.metricsService.jobsProcessed.inc();
      await this.logJob(job.id, 'completed', 'Job executed successfully');

      let recipient: string = process.env.GMAIL_USER || '';
      if (
        job.payload &&
        typeof job.payload === 'object' &&
        'to' in job.payload
      ) {
        const toValue = (job.payload as Record<string, unknown>).to;
        if (typeof toValue === 'string') {
          recipient = toValue;
        }
      }
      try {
        await this.mailService.sendMail(
          recipient,
          `Job "${job.name}" Completed`,
          `Your job "${job.name}" has completed successfully.`,
        );
      } catch (error) {
        await this.logJob(
          job.id,
          'failed',
          `Failed to send email: ${error instanceof Error ? error.message : String(error)}`,
        );
      }

      if (job.recurrence !== 'none') {
        await this.rescheduleJob(job);
      }
    } catch (error) {
      // Retry and dead-letter logic
      const retryCount = (job.retry_count ?? 0) + 1;
      if (retryCount < (job.max_retries ?? 3)) {
        // Retry: set status back to pending, increment retry_count
        await this.update(job.id, {
          status: 'pending',
          retry_count: retryCount,
          last_executed_at: new Date().toISOString(),
        });
        this.metricsService.jobsFailed.inc();
        await this.logJob(
          job.id,
          'failed',
          `Job failed (retry ${retryCount}): ${error instanceof Error ? error.message : String(error)}`,
        );
      } else {
        // Dead-letter: mark as failed and dead_lettered
        await this.update(job.id, {
          status: 'failed',
          retry_count: retryCount,
          dead_lettered: true,
          last_executed_at: new Date().toISOString(),
        });
        this.metricsService.jobsFailed.inc();
        this.metricsService.jobsDeadLettered.inc();
        console.warn(
          `Job ${job.id} has been dead-lettered after ${retryCount} attempts.`,
        );
        await this.logJob(
          job.id,
          'failed',
          `Job dead-lettered after ${retryCount} attempts: ${error instanceof Error ? error.message : String(error)}`,
        );
      }
    }
  }

  /**
   * Reschedules recurring jobs by creating a new job entry with updated scheduled_at.
   *
   */
  private async rescheduleJob(job: Job) {
    const nextScheduledAt = new Date(job.scheduled_at);
    switch (job.recurrence.toLowerCase()) {
      case 'daily':
        nextScheduledAt.setDate(nextScheduledAt.getDate() + 1);
        break;
      case 'weekly':
        nextScheduledAt.setDate(nextScheduledAt.getDate() + 7);
        break;
      default:
        return;
    }

    const newJob = this.jobRepository.create({
      ...job,
      id: uuidv4(),
      status: 'pending',
      scheduled_at: nextScheduledAt,
      created_at: new Date(),
      updated_at: new Date(),
    });
    await this.jobRepository.save(newJob);
  }

  /**
   * Reschedules all pending jobs by invoking the scheduler service.
   */
  async reschedulePendingJobs() {
    const pendingJobs = await this.jobRepository.find({
      where: { status: 'pending' },
    });
    pendingJobs.forEach((job) => {
      this.schedulerService.schedule(job);
    });
  }
}
