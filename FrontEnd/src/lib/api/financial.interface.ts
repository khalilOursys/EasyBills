// lib/api/financial.interface.ts

/**
 * Financial Report Request DTO
 * Used for requesting financial reports with date filters
 */
export interface FinancialReportRequest {
  /** Start date in YYYY-MM-DD format */
  startDate: string;
  /** End date in YYYY-MM-DD format */
  endDate: string;
  /** Optional status filter (DRAFT, VALIDATED, PAID, CANCELLED, CLOSED) */
  status?: string;
  /** Optional type filter (SALE_INVOICE, PURCHASE_ORDER, etc.) */
  type?: string;
}

/**
 * Financial Period
 * Represents the date range of the report
 */
export interface FinancialPeriod {
  /** Start date of the period */
  startDate: Date;
  /** End date of the period */
  endDate: Date;
}

/**
 * Financial Summary
 * Contains aggregated financial data for the period
 */
export interface FinancialSummary {
  /** Total amount of all expenses */
  totalExpenses: number;
  /** Total amount of all sales */
  totalSales: number;
  /** Total amount of all purchases */
  totalPurchases: number;
  /** Net profit = totalSales - totalExpenses - totalPurchases */
  netProfit: number;
  /** Number of expenses */
  expenseCount: number;
  /** Number of sale invoices */
  saleCount: number;
  /** Number of purchase invoices */
  purchaseCount: number;
}

/**
 * Financial Item Detail
 * Represents individual items within an invoice
 */
export interface FinancialItemDetail {
  /** Name of the product or service */
  productName: string;
  /** Quantity of the item */
  quantity: number;
  /** Unit price of the item */
  price: number;
  /** Total price (quantity * price) */
  total: number;
}

/**
 * Financial Item
 * Represents a single financial transaction (expense, sale, or purchase)
 */
export interface FinancialItem {
  /** Unique identifier */
  id: number;
  /** Invoice or transaction number */
  number: string;
  /** Date of the transaction */
  date: Date;
  /** Type of transaction (SALE_INVOICE, PURCHASE_ORDER, EXPENSE, etc.) */
  type: string;
  /** Status of the transaction (DRAFT, VALIDATED, PAID, etc.) */
  status: string;
  /** Total amount including tax */
  total: number;
  /** Name of the client or supplier */
  clientOrSupplier: string;
  /** Payment method used (optional) */
  paymentMethod?: string;
  /** List of items in the transaction (optional) */
  items?: FinancialItemDetail[];
}

/**
 * Financial Report Response
 * Complete financial report data
 */
export interface FinancialReportResponse {
  /** Date range of the report */
  period: FinancialPeriod;
  /** Aggregated summary data */
  summary: FinancialSummary;
  /** List of expenses */
  expenses: FinancialItem[];
  /** List of sale invoices */
  saleInvoices: FinancialItem[];
  /** List of purchase invoices */
  purchaseInvoices: FinancialItem[];
}

/**
 * Financial Summary Response
 * Simplified summary-only response
 */
export interface FinancialSummaryResponse {
  /** Total amount of all expenses */
  totalExpenses: number;
  /** Total amount of all sales */
  totalSales: number;
  /** Total amount of all purchases */
  totalPurchases: number;
  /** Net profit = totalSales - totalExpenses - totalPurchases */
  netProfit: number;
  /** Number of expenses */
  expenseCount: number;
  /** Number of sale invoices */
  saleCount: number;
  /** Number of purchase invoices */
  purchaseCount: number;
}

// Type aliases for commonly used types
export type FinancialItemType = 'EXPENSE' | 'SALE_INVOICE' | 'PURCHASE_INVOICE';
export type FinancialItemStatus = 'DRAFT' | 'VALIDATED' | 'PAID' | 'CANCELLED' | 'CLOSED';

// Helper function to format currency
export function formatCurrency(amount: number, currency: string = 'DT'): string {
  return `${amount.toFixed(3)} ${currency}`;
}

// Helper function to get status color
export function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    DRAFT: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
    VALIDATED: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
    PAID: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
    CANCELLED: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
    CLOSED: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300',
  };
  return colors[status] || colors.DRAFT;
}