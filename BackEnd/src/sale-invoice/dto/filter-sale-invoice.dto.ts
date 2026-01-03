import { IsDateString, IsEnum, IsOptional, IsString } from 'class-validator';
import { InvoiceStatus, SaleInvoiceType } from '@prisma/client';

export class FilterSaleInvoiceDto {
  @IsDateString()
  @IsOptional()
  startDate?: string;

  @IsDateString()
  @IsOptional()
  endDate?: string;

  @IsEnum(InvoiceStatus)
  @IsOptional()
  status?: InvoiceStatus;

  @IsEnum(SaleInvoiceType)
  @IsOptional()
  type?: SaleInvoiceType;

  @IsString()
  @IsOptional()
  clientName?: string;

  @IsString()
  @IsOptional()
  invoiceNumber?: string;
}
