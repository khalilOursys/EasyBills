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

export class FinancialReportItemDto {
  id: number;
  number: string;
  date: Date;
  type: string;
  status: string;
  total: number;
  clientOrSupplier: string;
  paymentMethod?: string;
  items?: any[];
}

export class FinancialSummaryDto {
  totalExpenses: number;
  totalSales: number;
  totalPurchases: number;
  netProfit: number;
  expenseCount: number;
  saleCount: number;
  purchaseCount: number;
}

export class FinancialReportResponseDto {
  period: {
    startDate: Date;
    endDate: Date;
  };
  summary: FinancialSummaryDto;
  expenses: FinancialReportItemDto[];
  saleInvoices: FinancialReportItemDto[];
  purchaseInvoices: FinancialReportItemDto[];
}
