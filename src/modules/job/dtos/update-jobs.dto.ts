import { IsOptional, IsString } from 'class-validator';

export class UpdateJobDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  payload?: any;

  @IsOptional()
  @IsString()
  scheduled_at?: string;

  @IsOptional()
  @IsString()
  recurrence?: string;

  @IsOptional()
  @IsString()
  status?: string;
}
