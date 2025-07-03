import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Job } from '../database/entities/job.entity';
import { EventEmitter } from 'events';

@Injectable()
export class SchedulerService {
  private readonly logger = new Logger(SchedulerService.name);
  private readonly emitter = new EventEmitter();
  private pollingInterval: NodeJS.Timeout;

  /**
   * SchedulerService constructor.
   * Injects the Job repository and starts polling for due jobs.
   * Also processes overdue jobs on startup for crash resilience.
   * @param jobRepository Repository<Job> injected repository for Job entity
   */
  constructor(
    @InjectRepository(Job)
    private readonly jobRepository: Repository<Job>,
  ) {
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
        this.emitter.emit('job-due', job);
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
    const POLL_INTERVAL = Number(process.env.POLL_INTERVAL_MS) || 10000; // Default 10s
    this.pollingInterval = setInterval(() => {
      void (async () => {
        try {
          const jobs = await this.fetchDueJobs();
          for (const job of jobs) {
            this.emitter.emit('job-due', job);
          }
        } catch (error: unknown) {
          this.logger.error(
            `Polling error: ${error instanceof Error ? error.message : String(error)}`,
          );
        }
      })();
    }, POLL_INTERVAL);
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

  onJobDue(listener: (job: Job) => void) {
    this.emitter.on('job-due', listener);
  }

  /**
   * No-op schedule method.
   * All jobs are picked up by polling for reliability and persistence.
   * Logs the scheduling of a job.
   * @param job Job to schedule
   */
  schedule(job: Job) {
    this.logger.log(`Job ${job.id} scheduled for ${String(job.scheduled_at)}`);
  }

  /**
   * Stops the polling interval if it is running.
   */
  stopPolling() {
    if (this.pollingInterval) {
      clearInterval(this.pollingInterval);
    }
  }
}
