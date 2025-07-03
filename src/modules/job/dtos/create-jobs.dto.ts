import { IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateJobDto {
  @ApiProperty()
  @IsString()
  name: string;

  @ApiProperty()
  payload: any;

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
