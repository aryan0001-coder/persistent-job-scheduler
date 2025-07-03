import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Job } from './modules/database/entities/job.entity';
import { JobLog } from './modules/database/entities/job-log.entity';
import { JobModule } from './modules/job/job.module';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST,
      port: Number(process.env.DB_PORT) || 5432,
      username: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      entities: [Job, JobLog],
      synchronize: true, // Set to false in production and use migrations!
    }),
    TypeOrmModule.forFeature([Job, JobLog]),
    JobModule,
  ],
})
export class AppModule {}
