import { Injectable } from '@nestjs/common';
import { Counter, Registry } from 'prom-client';

@Injectable()
export class MetricsService {
  private readonly registry = new Registry();

  public readonly jobsProcessed = new Counter({
    name: 'jobs_processed_total',
    help: 'Total number of jobs processed',
    registers: [this.registry],
  });

  public readonly jobsFailed = new Counter({
    name: 'jobs_failed_total',
    help: 'Total number of jobs failed',
    registers: [this.registry],
  });

  public readonly jobsDeadLettered = new Counter({
    name: 'jobs_dead_lettered_total',
    help: 'Total number of jobs dead-lettered',
    registers: [this.registry],
  });

  async getMetrics(): Promise<string> {
    return this.registry.metrics();
  }
}
