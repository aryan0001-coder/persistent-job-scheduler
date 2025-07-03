import { IsString } from 'class-validator';

/**
 * Data Transfer Object for creating a new Job.
 * Defines the required and optional fields for job creation.
 */
export class CreateJobDto {
  /**
   * Name of the job.
   */
  @IsString()
  name: string;

  /**
   * Payload data for the job.
   * Consider defining a more specific type if possible.
   */
  payload: any; // Consider defining a more specific type if possible

  /**
   * Scheduled date and time for the job in string format.
   */
  @IsString()
  scheduled_at: string;

  /**
   * Recurrence pattern for the job (e.g., 'daily', 'weekly', 'none').
   */
  @IsString()
  recurrence: string;
}
