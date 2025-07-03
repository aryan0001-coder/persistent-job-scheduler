import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { JobService } from './job.service';
import { CreateJobDto } from './dtos/create-jobs.dto';
import { UpdateJobDto } from './dtos/update-jobs.dto';
import { Job } from '../database/interface/job.interface';

/**
 * Controller for handling HTTP requests related to Jobs.
 * Provides endpoints for creating, retrieving, updating, and deleting jobs.
 */
@ApiTags('jobs')
@Controller('jobs')
export class JobController {
  constructor(private readonly jobService: JobService) {}

  /**
   * Creates a new job.
   * @param createJobDto Data Transfer Object containing job creation data
   * @returns Promise<Job> the created job
   */
  @Post()
  @ApiOperation({ summary: 'Create a new job' })
  @ApiResponse({
    status: 201,
    description: 'The job has been successfully created.',
    type: CreateJobDto,
  })
  async create(@Body() createJobDto: CreateJobDto): Promise<Job> {
    return this.jobService.create(createJobDto);
  }

  /**
   * Retrieves all jobs.
   * @returns Promise<Job[]> list of all jobs
   */
  @Get()
  @ApiOperation({ summary: 'Retrieve all jobs' })
  @ApiResponse({
    status: 200,
    description: 'List of all jobs',
    type: [CreateJobDto],
  })
  async findAll(): Promise<Job[]> {
    return this.jobService.findAll();
  }

  /**
   * Retrieves a job by its ID.
   * @param id string job ID
   * @returns Promise<Job> the found job
   */
  @Get(':id')
  @ApiOperation({ summary: 'Retrieve a job by ID' })
  @ApiResponse({
    status: 200,
    description: 'The found job',
    type: CreateJobDto,
  })
  async findOne(@Param('id') id: string): Promise<Job> {
    return this.jobService.findOne(id);
  }

  /**
   * Updates a job by its ID.
   * @param id string job ID
   * @param updateJobDto Data Transfer Object containing update data
   * @returns Promise<Job> the updated job
   */
  @Put(':id')
  @ApiOperation({ summary: 'Update a job by ID' })
  @ApiResponse({
    status: 200,
    description: 'The updated job',
    type: UpdateJobDto,
  })
  async update(
    @Param('id') id: string,
    @Body() updateJobDto: UpdateJobDto,
  ): Promise<Job> {
    return this.jobService.update(id, updateJobDto);
  }

  /**
   * Deletes a job by its ID.
   * @param id string job ID
   */
  @Delete(':id')
  @ApiOperation({ summary: 'Delete a job by ID' })
  @ApiResponse({
    status: 204,
    description: 'The job has been successfully deleted.',
  })
  async remove(@Param('id') id: string): Promise<void> {
    return this.jobService.remove(id);
  }
}
