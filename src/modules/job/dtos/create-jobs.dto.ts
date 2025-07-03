import { IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

/**
 * Data Transfer Object for creating a new Job.
 * Defines the required and optional fields for job creation.
 */
export class CreateJobDto {
  /**
   * Name of the job.
   */
  @ApiProperty()
  @IsString()
  name: string;

  /**
   * Payload data for the job.
   * Consider defining a more specific type if possible.
   */
  @ApiProperty()
  payload: any; // Consider defining a more specific type if possible

  /**
   * Scheduled date and time for the job in string format.
   */
  @ApiProperty()
  @IsString()
  scheduled_at: string;

  /**
   * Recurrence pattern for the job (e.g., 'daily', 'weekly', 'none').
   */
  @ApiProperty()
  @IsString()
  recurrence: string;
}
