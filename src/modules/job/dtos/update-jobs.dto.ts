import { IsOptional, IsString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateJobDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional()
  @IsOptional()
  payload?: any;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  scheduled_at?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  recurrence?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  status?: string;
}
