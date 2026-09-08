// src/app/financial-report/page.tsx
"use client";

import { useState, useEffect } from "react";
import { MaterialReactTable, type MRT_ColumnDef } from "material-react-table";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import * as Toast from "@radix-ui/react-toast";
import { format } from "date-fns";
import {
  Calendar,
  Download,
  RefreshCw,
  TrendingUp,
  TrendingDown,
  DollarSign,
  ShoppingCart,
  FileText
} from "lucide-react";

// Import interfaces
import {
  FinancialReportRequest,
  FinancialReportResponse,
  FinancialItem,
  FinancialSummary
} from "@/lib/api/financial.interface";

// API Service
const fetchFinancialReport = async (params: FinancialReportRequest): Promise<FinancialReportResponse> => {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}financial/report`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(params),
  });
  if (!res.ok) throw new Error("Failed to fetch financial report");
  return res.json();
};

export default function FinancialReportPage() {
  const queryClient = useQueryClient();

  const [startDate, setStartDate] = useState(() => {
    const date = new Date();
    date.setDate(1); // First day of current month
    return date.toISOString().split('T')[0];
  });

  const [endDate, setEndDate] = useState(() => {
    const date = new Date();
    return date.toISOString().split('T')[0];
  });

  const [status, setStatus] = useState<string>("");
  const [type, setType] = useState<string>("");
  const [toastOpen, setToastOpen] = useState(false);
  const [toastMsg, setToastMsg] = useState("");
  const [toastType, setToastType] = useState<"success" | "error">("success");
  const [theme, setTheme] = useState<"light" | "dark">("light");

  const showToast = (msg: string, type: "success" | "error" = "success") => {
    setToastMsg(msg);
    setToastType(type);
    setToastOpen(true);
  };

  const {
    data,
    isLoading,
    isError,
    refetch
  } = useQuery<FinancialReportResponse>({
    queryKey: ["financialReport", startDate, endDate, status, type],
    queryFn: () => fetchFinancialReport({
      startDate,
      endDate,
      status: status || undefined,
      type: type || undefined,
    }),
    enabled: !!startDate && !!endDate,
  });

  const handleGenerateReport = () => {
    if (!startDate || !endDate) {
      showToast("Please select both start and end dates", "error");
      return;
    }
    refetch();
  };

  const handleRefresh = () => {
    refetch();
    showToast("Report refreshed successfully", "success");
  };

  // Columns for Sale Invoices
  const saleInvoiceColumns: MRT_ColumnDef<FinancialItem>[] = [
    {
      accessorKey: "number",
      header: "Invoice Number",
      size: 150,
    },
    {
      accessorKey: "date",
      header: "Date",
      size: 120,
      Cell: ({ cell }) => {
        const date = cell.getValue<Date>();
        return format(new Date(date), "dd/MM/yyyy");
      },
    },
    {
      accessorKey: "clientOrSupplier",
      header: "Client",
      size: 180,
    },
    {
      accessorKey: "status",
      header: "Status",
      size: 120,
      Cell: ({ cell }) => {
        const status = cell.getValue<string>();
        const statusColors: Record<string, string> = {
          DRAFT: "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300",
          VALIDATED: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
          PAID: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
          CANCELLED: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300",
          CLOSED: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300",
        };
        return (
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[status] || statusColors.DRAFT}`}>
            {status}
          </span>
        );
      },
    },
    {
      accessorKey: "paymentMethod",
      header: "Payment Method",
      size: 140,
      Cell: ({ cell }) => {
        const method = cell.getValue<string>();
        return method ? method.replace(/_/g, ' ') : '-';
      },
    },
    {
      accessorKey: "total",
      header: "Total (TTC)",
      size: 130,
      Cell: ({ cell }) => {
        const total = cell.getValue<number>();
        return (
          <span className="font-semibold text-green-600 dark:text-green-400">
            {total.toFixed(3)} DT
          </span>
        );
      },
    },
  ];

  // Columns for Purchase Invoices
  const purchaseInvoiceColumns: MRT_ColumnDef<FinancialItem>[] = [
    {
      accessorKey: "number",
      header: "Invoice Number",
      size: 150,
    },
    {
      accessorKey: "date",
      header: "Date",
      size: 120,
      Cell: ({ cell }) => {
        const date = cell.getValue<Date>();
        return format(new Date(date), "dd/MM/yyyy");
      },
    },
    {
      accessorKey: "clientOrSupplier",
      header: "Supplier",
      size: 180,
    },
    {
      accessorKey: "status",
      header: "Status",
      size: 120,
      Cell: ({ cell }) => {
        const status = cell.getValue<string>();
        const statusColors: Record<string, string> = {
          DRAFT: "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300",
          VALIDATED: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
          PAID: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
          CANCELLED: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300",
          CLOSED: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300",
        };
        return (
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[status] || statusColors.DRAFT}`}>
            {status}
          </span>
        );
      },
    },
    {
      accessorKey: "paymentMethod",
      header: "Payment Method",
      size: 140,
      Cell: ({ cell }) => {
        const method = cell.getValue<string>();
        return method ? method.replace(/_/g, ' ') : '-';
      },
    },
    {
      accessorKey: "total",
      header: "Total (TTC)",
      size: 130,
      Cell: ({ cell }) => {
        const total = cell.getValue<number>();
        return (
          <span className="font-semibold text-blue-600 dark:text-blue-400">
            {total.toFixed(3)} DT
          </span>
        );
      },
    },
  ];

  // Columns for Expenses
  const expenseColumns: MRT_ColumnDef<FinancialItem>[] = [
    {
      accessorKey: "number",
      header: "Expense ID",
      size: 120,
    },
    {
      accessorKey: "date",
      header: "Date",
      size: 120,
      Cell: ({ cell }) => {
        const date = cell.getValue<Date>();
        return format(new Date(date), "dd/MM/yyyy");
      },
    },
    {
      accessorKey: "clientOrSupplier",
      header: "Title",
      size: 200,
    },
    {
      accessorKey: "status",
      header: "Status",
      size: 120,
      Cell: () => (
        <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300">
          PAID
        </span>
      ),
    },
    {
      accessorKey: "total",
      header: "Amount",
      size: 130,
      Cell: ({ cell }) => {
        const total = cell.getValue<number>();
        return (
          <span className="font-semibold text-red-600 dark:text-red-400">
            {total.toFixed(3)} DT
          </span>
        );
      },
    },
  ];

  // Summary Cards Component
  const SummaryCards = ({ summary }: { summary: FinancialSummary }) => (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Total Sales</p>
            <p className="text-2xl font-bold text-green-600 dark:text-green-400">
              {summary.totalSales.toFixed(3)} DT
            </p>
            <p className="text-xs text-gray-400">{summary.saleCount} invoices</p>
          </div>
          <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-full">
            <TrendingUp className="w-6 h-6 text-green-600 dark:text-green-400" />
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Total Purchases</p>
            <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {summary.totalPurchases.toFixed(3)} DT
            </p>
            <p className="text-xs text-gray-400">{summary.purchaseCount} invoices</p>
          </div>
          <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-full">
            <ShoppingCart className="w-6 h-6 text-blue-600 dark:text-blue-400" />
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Total Expenses</p>
            <p className="text-2xl font-bold text-red-600 dark:text-red-400">
              {summary.totalExpenses.toFixed(3)} DT
            </p>
            <p className="text-xs text-gray-400">{summary.expenseCount} expenses</p>
          </div>
          <div className="p-3 bg-red-100 dark:bg-red-900/30 rounded-full">
            <TrendingDown className="w-6 h-6 text-red-600 dark:text-red-400" />
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Net Profit</p>
            <p className={`text-2xl font-bold ${summary.netProfit >= 0 ? 'text-purple-600 dark:text-purple-400' : 'text-orange-600 dark:text-orange-400'}`}>
              {summary.netProfit.toFixed(3)} DT
            </p>
            <p className="text-xs text-gray-400">
              {summary.netProfit >= 0 ? 'Profit' : 'Loss'}
            </p>
          </div>
          <div className={`p-3 ${summary.netProfit >= 0 ? 'bg-purple-100 dark:bg-purple-900/30' : 'bg-orange-100 dark:bg-orange-900/30'} rounded-full`}>
            <DollarSign className={`w-6 h-6 ${summary.netProfit >= 0 ? 'text-purple-600 dark:text-purple-400' : 'text-orange-600 dark:text-orange-400'}`} />
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <Toast.Provider swipeDirection="right">
      <div className="p-6 min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
        {/* Header */}
        <div className="flex flex-wrap justify-between items-center mb-6 gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <FileText className="w-8 h-8 text-blue-600" />
              Financial Report
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              View all expenses, sale invoices, and purchase invoices between dates
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleRefresh}
              className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors flex items-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              Refresh
            </button>
            <button
              onClick={() => {/* TODO: Export to PDF/Excel */ }}
              className="px-4 py-2 bg-blue-600 dark:bg-blue-700 text-white rounded-md hover:bg-blue-700 dark:hover:bg-blue-800 transition-colors flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              Export
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow mb-6">
          <div className="flex flex-wrap gap-4 items-end">
            <div className="flex-1 min-w-[180px]">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Start Date
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
            <div className="flex-1 min-w-[180px]">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                End Date
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
            <div className="flex-1 min-w-[150px]">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="">All Status</option>
                <option value="DRAFT">Draft</option>
                <option value="VALIDATED">Validated</option>
                <option value="PAID">Paid</option>
                <option value="CANCELLED">Cancelled</option>
                <option value="CLOSED">Closed</option>
              </select>
            </div>
            <div className="flex-1 min-w-[150px]">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Type
              </label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="">All Types</option>
                <option value="SALE_INVOICE">Sale Invoice</option>
                <option value="PURCHASE_ORDER">Purchase Order</option>
                <option value="PURCHASE_INVOICE">Purchase Invoice</option>
                <option value="QUOTATION">Quotation</option>
                <option value="DELIVERY_NOTE">Delivery Note</option>
                <option value="SALE_REFUND">Sale Refund</option>
                <option value="PURCHASE_REFUND">Purchase Refund</option>
              </select>
            </div>
            <div>
              <button
                onClick={handleGenerateReport}
                className="px-6 py-2 bg-blue-600 dark:bg-blue-700 text-white rounded-md hover:bg-blue-700 dark:hover:bg-blue-800 transition-colors flex items-center gap-2"
              >
                <Calendar className="w-4 h-4" />
                Generate Report
              </button>
            </div>
          </div>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        )}

        {/* Error State */}
        {isError && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded-lg">
            <p>Failed to load financial report. Please try again.</p>
          </div>
        )}

        {/* Report Data */}
        {data && !isLoading && (
          <>
            {/* Summary Cards */}
            <SummaryCards summary={data.summary} />

            {/* Period Information */}
            <div className="text-sm text-gray-500 dark:text-gray-400 mb-4">
              Period: {format(new Date(data.period.startDate), "dd/MM/yyyy")} - {format(new Date(data.period.endDate), "dd/MM/yyyy")}
            </div>

            {/* Expenses Table */}
            {data.expenses.length > 0 && (
              <div className="mb-8">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <TrendingDown className="w-5 h-5 text-red-600" />
                  Expenses ({data.expenses.length})
                </h2>
                <div className="dark:bg-gray-800 dark:text-white rounded-lg overflow-hidden">
                  <MaterialReactTable
                    columns={expenseColumns}
                    data={data.expenses}
                    enableColumnActions={true}
                    enableColumnFilters={true}
                    enablePagination={true}
                    enableSorting={true}
                    enableBottomToolbar={true}
                    enableTopToolbar={true}
                    muiTablePaperProps={{
                      sx: {
                        backgroundColor: theme === "dark" ? "#1f2937" : "#ffffff",
                        color: theme === "dark" ? "#f3f4f6" : "#111827",
                      },
                    }}
                    muiTableHeadCellProps={{
                      sx: {
                        backgroundColor: theme === "dark" ? "#374151" : "#f9fafb",
                        color: theme === "dark" ? "#f3f4f6" : "#374151",
                        fontWeight: "bold",
                      },
                    }}
                    muiTableBodyCellProps={{
                      sx: {
                        borderBottomColor: theme === "dark" ? "#374151" : "#e5e7eb",
                        color: theme === "dark" ? "#f3f4f6" : "#111827",
                      },
                    }}
                    muiTopToolbarProps={{
                      sx: {
                        backgroundColor: theme === "dark" ? "#1f2937" : "#ffffff",
                        color: theme === "dark" ? "#f3f4f6" : "#111827",
                      },
                    }}
                    muiBottomToolbarProps={{
                      sx: {
                        backgroundColor: theme === "dark" ? "#1f2937" : "#ffffff",
                        color: theme === "dark" ? "#f3f4f6" : "#111827",
                      },
                    }}
                  />
                </div>
              </div>
            )}

            {/* Sale Invoices Table */}
            {data.saleInvoices.length > 0 && (
              <div className="mb-8">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-green-600" />
                  Sale Invoices ({data.saleInvoices.length})
                </h2>
                <div className="dark:bg-gray-800 dark:text-white rounded-lg overflow-hidden">
                  <MaterialReactTable
                    columns={saleInvoiceColumns}
                    data={data.saleInvoices}
                    enableColumnActions={true}
                    enableColumnFilters={true}
                    enablePagination={true}
                    enableSorting={true}
                    enableBottomToolbar={true}
                    enableTopToolbar={true}
                    muiTablePaperProps={{
                      sx: {
                        backgroundColor: theme === "dark" ? "#1f2937" : "#ffffff",
                        color: theme === "dark" ? "#f3f4f6" : "#111827",
                      },
                    }}
                    muiTableHeadCellProps={{
                      sx: {
                        backgroundColor: theme === "dark" ? "#374151" : "#f9fafb",
                        color: theme === "dark" ? "#f3f4f6" : "#374151",
                        fontWeight: "bold",
                      },
                    }}
                    muiTableBodyCellProps={{
                      sx: {
                        borderBottomColor: theme === "dark" ? "#374151" : "#e5e7eb",
                        color: theme === "dark" ? "#f3f4f6" : "#111827",
                      },
                    }}
                    muiTopToolbarProps={{
                      sx: {
                        backgroundColor: theme === "dark" ? "#1f2937" : "#ffffff",
                        color: theme === "dark" ? "#f3f4f6" : "#111827",
                      },
                    }}
                    muiBottomToolbarProps={{
                      sx: {
                        backgroundColor: theme === "dark" ? "#1f2937" : "#ffffff",
                        color: theme === "dark" ? "#f3f4f6" : "#111827",
                      },
                    }}
                  />
                </div>
              </div>
            )}

            {/* Purchase Invoices Table */}
            {data.purchaseInvoices.length > 0 && (
              <div className="mb-8">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <ShoppingCart className="w-5 h-5 text-blue-600" />
                  Purchase Invoices ({data.purchaseInvoices.length})
                </h2>
                <div className="dark:bg-gray-800 dark:text-white rounded-lg overflow-hidden">
                  <MaterialReactTable
                    columns={purchaseInvoiceColumns}
                    data={data.purchaseInvoices}
                    enableColumnActions={true}
                    enableColumnFilters={true}
                    enablePagination={true}
                    enableSorting={true}
                    enableBottomToolbar={true}
                    enableTopToolbar={true}
                    muiTablePaperProps={{
                      sx: {
                        backgroundColor: theme === "dark" ? "#1f2937" : "#ffffff",
                        color: theme === "dark" ? "#f3f4f6" : "#111827",
                      },
                    }}
                    muiTableHeadCellProps={{
                      sx: {
                        backgroundColor: theme === "dark" ? "#374151" : "#f9fafb",
                        color: theme === "dark" ? "#f3f4f6" : "#374151",
                        fontWeight: "bold",
                      },
                    }}
                    muiTableBodyCellProps={{
                      sx: {
                        borderBottomColor: theme === "dark" ? "#374151" : "#e5e7eb",
                        color: theme === "dark" ? "#f3f4f6" : "#111827",
                      },
                    }}
                    muiTopToolbarProps={{
                      sx: {
                        backgroundColor: theme === "dark" ? "#1f2937" : "#ffffff",
                        color: theme === "dark" ? "#f3f4f6" : "#111827",
                      },
                    }}
                    muiBottomToolbarProps={{
                      sx: {
                        backgroundColor: theme === "dark" ? "#1f2937" : "#ffffff",
                        color: theme === "dark" ? "#f3f4f6" : "#111827",
                      },
                    }}
                  />
                </div>
              </div>
            )}

            {/* No Data Message */}
            {data.expenses.length === 0 &&
              data.saleInvoices.length === 0 &&
              data.purchaseInvoices.length === 0 && (
                <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg shadow">
                  <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500 dark:text-gray-400">No financial data found for the selected period</p>
                </div>
              )}
          </>
        )}

        {/* Toast Notification */}
        <Toast.Root
          open={toastOpen}
          onOpenChange={setToastOpen}
          className={`${toastType === "success"
              ? "bg-green-600 dark:bg-green-700"
              : "bg-red-600 dark:bg-red-700"
            } text-white px-4 py-3 rounded-md shadow-lg`}
        >
          <Toast.Title className="font-bold">{toastMsg}</Toast.Title>
        </Toast.Root>
        <Toast.Viewport className="fixed top-4 right-4 w-96 max-w-full outline-none z-50" />
      </div>
    </Toast.Provider>
  );
}