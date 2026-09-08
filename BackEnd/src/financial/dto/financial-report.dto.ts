// src/financial/dto/financial-report.dto.ts
import { IsDateString, IsOptional, IsString } from 'class-validator';

export class FinancialReportRequestDto {
  @IsDateString()
  startDate: string;

  @IsDateString()
  endDate: string;

  @IsOptional()
  @IsString()
  status?: string;

  @IsOptional()
  @IsString()
  type?: string;
}
