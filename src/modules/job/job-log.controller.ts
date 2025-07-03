import { Controller, Get, Param, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JobLog } from '../database/entities/job-log.entity';

@Controller('jobs/:jobId/logs')
export class JobLogController {
  constructor(
    @InjectRepository(JobLog)
    private readonly jobLogRepository: Repository<JobLog>,
  ) {}

  @Get()
  async getLogs(@Param('jobId') jobId: string) {
    return this.jobLogRepository.find({
      where: { job: { id: jobId } },
      relations: ['job'],
    });
  }

  @Get(':logId')
  async getLog(@Param('jobId') jobId: string, @Param('logId') logId: string) {
    const log = await this.jobLogRepository.findOne({
      where: { id: logId, job: { id: jobId } },
      relations: ['job'],
    });
    if (!log) throw new NotFoundException('Log not found');
    return log;
  }
}
