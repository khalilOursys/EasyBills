// src/financial/financial.service.ts
import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { FinancialReportRequestDto } from './dto/financial-report.dto';

@Injectable()
export class FinancialService {
  constructor(private readonly prisma: PrismaService) {}

  async getFinancialReport(dto: FinancialReportRequestDto) {
    const startDate = new Date(dto.startDate);
    const endDate = new Date(dto.endDate);
    endDate.setHours(23, 59, 59, 999);

    if (startDate > endDate) {
      throw new BadRequestException('Start date must be before end date');
    }

    const whereCondition: any = {
      date: {
        gte: startDate,
        lte: endDate,
      },
    };

    if (dto.status) {
      whereCondition.status = dto.status;
    }

    if (dto.type) {
      whereCondition.type = dto.type;
    }

    const [expenses, saleInvoices, purchaseInvoices] = await Promise.all([
      this.getExpenses(startDate, endDate),
      this.getSaleInvoices(whereCondition),
      this.getPurchaseInvoices(whereCondition),
    ]);

    const summary = this.calculateSummary(
      expenses,
      saleInvoices,
      purchaseInvoices,
    );

    return {
      period: {
        startDate,
        endDate,
      },
      summary,
      expenses: expenses.map((exp) => this.mapExpenseToDto(exp)),
      saleInvoices: saleInvoices.map((inv) => this.mapSaleInvoiceToDto(inv)),
      purchaseInvoices: purchaseInvoices.map((inv) =>
        this.mapPurchaseInvoiceToDto(inv),
      ),
    };
  }

  private async getExpenses(startDate: Date, endDate: Date) {
    return this.prisma.expense.findMany({
      where: {
        date: {
          gte: startDate,
          lte: endDate,
        },
      },
      orderBy: {
        date: 'desc',
      },
    });
  }

  private async getSaleInvoices(whereCondition: any) {
    return this.prisma.saleInvoice.findMany({
      where: {
        ...whereCondition,
        status: {
          not: 'CANCELLED',
        },
      },
      include: {
        client: true,
        items: {
          include: {
            product: true,
          },
        },
        payments: true,
      },
      orderBy: {
        date: 'desc',
      },
    });
  }

  private async getPurchaseInvoices(whereCondition: any) {
    return this.prisma.purchaseInvoice.findMany({
      where: {
        ...whereCondition,
        status: {
          not: 'CANCELLED',
        },
      },
      include: {
        supplier: true,
        items: {
          include: {
            product: true,
            rawMaterial: true,
            service: true,
          },
        },
        payments: true,
      },
      orderBy: {
        date: 'desc',
      },
    });
  }

  private calculateSummary(
    expenses: any[],
    saleInvoices: any[],
    purchaseInvoices: any[],
  ) {
    const totalExpenses = expenses.reduce((sum, exp) => sum + exp.amount, 0);

    const totalSales = saleInvoices.reduce((sum, inv) => {
      return sum + (inv.totalTTC || this.calculateInvoiceTotal(inv.items));
    }, 0);

    const totalPurchases = purchaseInvoices.reduce((sum, inv) => {
      return sum + (inv.totalTTC || this.calculateInvoiceTotal(inv.items));
    }, 0);

    return {
      totalExpenses,
      totalSales,
      totalPurchases,
      netProfit: totalSales - totalExpenses - totalPurchases,
      expenseCount: expenses.length,
      saleCount: saleInvoices.length,
      purchaseCount: purchaseInvoices.length,
    };
  }

  private calculateInvoiceTotal(items: any[]) {
    return items.reduce((sum, item) => {
      const itemTotal = (item.quantity || 0) * (item.price || 0);
      const vatAmount = itemTotal * ((item.vatRate || 0) / 100);
      return sum + itemTotal + vatAmount;
    }, 0);
  }

  private mapExpenseToDto(expense: any) {
    return {
      id: expense.id,
      number: `EXP-${expense.id}`,
      date: expense.date,
      type: 'EXPENSE',
      status: 'PAID',
      total: expense.amount,
      clientOrSupplier: expense.title,
    };
  }

  private mapSaleInvoiceToDto(invoice: any) {
    const total = invoice.totalTTC || this.calculateInvoiceTotal(invoice.items);
    return {
      id: invoice.id,
      number: invoice.invoiceNumber,
      date: invoice.date,
      type: invoice.type,
      status: invoice.status,
      total: total,
      clientOrSupplier: invoice.client?.name || 'Unknown Client',
      paymentMethod:
        invoice.payments?.length > 0 ? invoice.payments[0]?.method : undefined,
      items: invoice.items?.map((item: any) => ({
        productName: item.product?.name || 'Unknown Product',
        quantity: item.quantity,
        price: item.price,
        total: item.quantity * item.price,
      })),
    };
  }

  private mapPurchaseInvoiceToDto(invoice: any) {
    const total = invoice.totalTTC || this.calculateInvoiceTotal(invoice.items);
    return {
      id: invoice.id,
      number: invoice.invoiceNumber,
      date: invoice.date,
      type: invoice.type,
      status: invoice.status,
      total: total,
      clientOrSupplier: invoice.supplier?.name || 'Unknown Supplier',
      paymentMethod:
        invoice.payments?.length > 0 ? invoice.payments[0]?.method : undefined,
      items: invoice.items?.map((item: any) => {
        const productName =
          item.product?.name ||
          item.rawMaterial?.name ||
          item.service?.name ||
          'Unknown Item';
        return {
          productName,
          quantity: item.quantity,
          price: item.price,
          total: item.quantity * item.price,
        };
      }),
    };
  }

  async getFinancialSummaryByPeriod(startDate: Date, endDate: Date) {
    const report = await this.getFinancialReport({
      startDate: startDate.toISOString().split('T')[0],
      endDate: endDate.toISOString().split('T')[0],
    });
    return report.summary;
  }

  async getDailyFinancialReport(date: Date) {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    return this.getFinancialReport({
      startDate: startOfDay.toISOString().split('T')[0],
      endDate: endOfDay.toISOString().split('T')[0],
    });
  }

  async getMonthlyFinancialReport(year: number, month: number) {
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0);

    return this.getFinancialReport({
      startDate: startDate.toISOString().split('T')[0],
      endDate: endDate.toISOString().split('T')[0],
    });
  }

  async getYearlyFinancialReport(year: number) {
    const startDate = new Date(year, 0, 1);
    const endDate = new Date(year, 11, 31);

    return this.getFinancialReport({
      startDate: startDate.toISOString().split('T')[0],
      endDate: endDate.toISOString().split('T')[0],
    });
  }
}
