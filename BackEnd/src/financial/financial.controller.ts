// src/financial/financial.controller.ts
import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  Param,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { FinancialService } from './financial.service';
import { FinancialReportRequestDto } from './dto/financial-report.dto';

@Controller('financial')
export class FinancialController {
  constructor(private readonly financialService: FinancialService) {}

  @Post('report')
  @HttpCode(HttpStatus.OK)
  async getFinancialReport(@Body() dto: FinancialReportRequestDto) {
    return this.financialService.getFinancialReport(dto);
  }

  @Get('report/date/:date')
  async getDailyReport(@Param('date') date: string) {
    const parsedDate = new Date(date);
    return this.financialService.getDailyFinancialReport(parsedDate);
  }

  @Get('report/monthly/:year/:month')
  async getMonthlyReport(
    @Param('year') year: number,
    @Param('month') month: number,
  ) {
    return this.financialService.getMonthlyFinancialReport(year, month);
  }

  @Get('report/yearly/:year')
  async getYearlyReport(@Param('year') year: number) {
    return this.financialService.getYearlyFinancialReport(year);
  }

  @Get('summary')
  async getSummary(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ) {
    const start = new Date(startDate);
    const end = new Date(endDate);
    return this.financialService.getFinancialSummaryByPeriod(start, end);
  }
}
