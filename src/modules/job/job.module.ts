import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JobService } from './job.service';
import { JobController } from './job.controller';
import { SchedulerService } from '../scheduler/scheduler.service';
import { DatabaseModule } from '../database/database.module';
import { Job } from '../database/entities/job.entity';
import { JobLog } from '../database/entities/job-log.entity';
import { JobLogController } from './job-log.controller';
import { MailModule } from '../mail/mail.module';
import { CommonModule } from '../../common/common.module';

@Module({
  imports: [
    DatabaseModule,
    TypeOrmModule.forFeature([Job, JobLog]),
    MailModule,
    CommonModule,
  ],
  controllers: [JobController, JobLogController],
  providers: [JobService, SchedulerService],
})
export class JobModule {}
