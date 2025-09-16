// src/common/helpers/helper.ts
import { PrismaClient, Prisma } from '@prisma/client';

export interface FindAllOptions {
  search?: string;
  searchFields?: string[];       // Fields to search in
  filters?: Record<string, any>; // Extra filters
  page?: number;                 // Page number (1-based)
  pageSize?: number;             // Items per page
  startDate?: Date;              // Filter start date
  endDate?: Date;                // Filter end date
  dateField?: 'createdAt' | 'updatedAt'; // Field to apply date filter
}

export async function findAllWithSearchAndPagination<T extends { [key: string]: any }>(
  model: any,                 // e.g., prisma.user
  options: FindAllOptions
): Promise<{ data: T[]; total: number }> {
  const {
    search,
    searchFields = [],
    filters = {},
    page = 1,
    pageSize = 10,
    startDate,
    endDate,
    dateField = 'createdAt',
  } = options;

  const where: Prisma.Enumerable<Prisma.Enumerable<any>> = { ...filters };

  // Search
  if (search && searchFields.length) {
    where.OR = searchFields.map(field => ({
      [field]: { contains: search, mode: 'insensitive' },
    }));
  }

  // Date range
  if (startDate || endDate) {
    where[dateField] = {};
    if (startDate) where[dateField].gte = startDate;
    if (endDate) where[dateField].lte = endDate;
  }

  const skip = (page - 1) * pageSize;
  const take = pageSize;

  const [data, total] = await Promise.all([
    model.findMany({ where, skip, take }),
    model.count({ where }),
  ]);

  return { data, total };
}
