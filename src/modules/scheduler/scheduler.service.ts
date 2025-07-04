import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Job } from '../database/entities/job.entity';
import { EventEmitter } from 'events';
import * as cron from 'node-cron';
import Redis from 'ioredis';

@Injectable()
export class SchedulerService {
  private readonly logger = new Logger(SchedulerService.name);
  private readonly emitter = new EventEmitter();
  private pollingTask: cron.ScheduledTask;
  private redis: Redis;
  private isShuttingDown = false;
  private activeJobs = 0;

  /**
   * SchedulerService constructor.
   * Injects the Job repository and starts polling for due jobs.
   */
  constructor(
    @InjectRepository(Job)
    private readonly jobRepository: Repository<Job>,
  ) {
    // Connect to Redis (default: localhost:6379)
    this.redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');
    // Start polling and process overdue jobs on startup for crash resilience
    void this.startPolling();
    void this.processOverdueJobs();
  }

  /**
   * Processes all jobs that are overdue (missed while server was down) on startup.
   * Emits 'job-due' event for each overdue job.
   */
  private async processOverdueJobs() {
    this.logger.log('Checking for overdue jobs on startup...');
    try {
      const overdueJobs = await this.fetchDueJobs();
      for (const job of overdueJobs) {
        await this.emitWithLock(job);
      }
    } catch (error: unknown) {
      this.logger.error(
        `Error processing overdue jobs: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  /**
   * Starts polling the database at a configurable interval to pick up due jobs.
   * Emits 'job-due' event for each due job found.
   */
  private startPolling() {
    const POLL_CRON = process.env.POLL_CRON || '*/1 * * * *';
    this.pollingTask = cron.schedule(POLL_CRON, async () => {
      try {
        const jobs = await this.fetchDueJobs();
        for (const job of jobs) {
          await this.emitWithLock(job);
        }
      } catch (error: unknown) {
        this.logger.error(
          `Polling error: ${error instanceof Error ? error.message : String(error)}`,
        );
      }
    });
    this.pollingTask.start();
  }

  /**
   * Fetches jobs that are due (status 'pending' and scheduled_at <= now).
   * Marks fetched jobs as 'running' to avoid duplicate processing.
   * Uses pessimistic write lock to prevent race conditions.
   * @returns Promise<Job[]> list of due jobs
   */
  private async fetchDueJobs(): Promise<Job[]> {
    return this.jobRepository.manager.transaction(async (manager) => {
      const jobs = await manager
        .createQueryBuilder(Job, 'job')
        .where('job.status = :status', { status: 'pending' })
        .andWhere('job.scheduled_at <= :now', { now: new Date() })
        .setLock('pessimistic_write')
        .getMany();

      if (jobs.length > 0) {
        await manager
          .createQueryBuilder()
          .update(Job)
          .set({ status: 'running', updated_at: new Date() })
          .where('id IN (:...ids)', { ids: jobs.map((job) => job.id) })
          .execute();
      }

      return jobs;
    });
  }

  // Distributed lock before emitting job-due
  private async emitWithLock(job: Job) {
    const lockKey = `job-lock:${job.id}`;
    const lockValue = `${process.pid}-${Date.now()}`;
    // Try to acquire lock for 30 seconds
    const acquired = await this.redis.set(lockKey, lockValue, 'EX', 30, 'NX');
    if (acquired) {
      this.activeJobs++;
      try {
        void this.emitter.emit('job-due', job);
      } finally {
        // Release lock (only if still owned)
        const currentValue = await this.redis.get(lockKey);
        if (currentValue === lockValue) {
          await this.redis.del(lockKey);
        }
        this.activeJobs--;
      }
    } else {
      this.logger.warn(
        `Job ${job.id} is already being processed by another worker.`,
      );
    }
  }

  onJobDue(listener: (job: Job) => void) {
    this.emitter.on('job-due', listener);
  }

  /**
   * No-op schedule method.
   * All jobs are picked up by polling for reliability and persistence.
   *
   */
  schedule(job: Job) {
    this.logger.log(`Job ${job.id} scheduled for ${String(job.scheduled_at)}`);
  }

  /**
   * Stops the polling interval if it is running.
   */
  stopPolling() {
    if (this.pollingTask) {
      this.pollingTask.stop();
    }
  }

  async shutdown() {
    this.isShuttingDown = true;
    if (this.pollingTask) {
      this.pollingTask.stop();
    }
    // Wait for active jobs to finish
    while (this.activeJobs > 0) {
      this.logger.log(
        `Waiting for ${this.activeJobs} active jobs to finish...`,
      );
      await new Promise((resolve) => setTimeout(resolve, 500));
    }
    this.logger.log('All jobs finished. Shutting down.');
  }
}
