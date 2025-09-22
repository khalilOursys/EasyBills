import {
  IsInt,
  IsOptional,
  IsString,
  Min,
  IsISO8601,
  IsObject,
} from 'class-validator';
import { Type } from 'class-transformer';

export class PaginationSearchDto {
  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  pageSize?: number = 10;

  @IsOptional()
  @IsISO8601()
  dateField?: string; // optional: "createdAt" or "updatedAt"

  @IsOptional()
  @IsISO8601()
  startDate?: string;

  @IsOptional()
  @IsISO8601()
  endDate?: string;

  @IsOptional()
  @IsString({ each: true })
  sortBy?: string; // optional sorting field

  @IsOptional()
  @IsString()
  sortOrder?: 'asc' | 'desc';

  @IsOptional()
  @IsObject()
  filters?: Record<string, any>; // ✅ column filters

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  roleId?: number;
}
