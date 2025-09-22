import { PrismaClient } from '@prisma/client';
import { PaginationSearchDto } from '../dto/pagination-search.dto';

const prisma = new PrismaClient();

/**
 * Common reusable function for pagination, search, filters & date criteria
 */
export async function findAllWithSearchAndCriteria<
  T extends keyof PrismaClient,
>(model: T, dto: PaginationSearchDto, searchFields: string[] = []) {
  const {
    search,
    page,
    pageSize,
    sortBy,
    sortOrder,
    startDate,
    endDate,
    dateField, // optional: "createdAt" or "updatedAt"
    filters = {},
  } = dto;

  // Convert roleId filter to number if it exists
  filters.roleId ? (filters.roleId = Number(filters.roleId)) : null;

  const where: any = { ...filters };

  if (where.isDeleted) {
    if (where.isDeleted == 'true') {
      where.isDeleted = true;
    } else {
      where.isDeleted = false;
    }
  }

  // search filter
  if (search && searchFields.length > 0) {
    where.OR = searchFields.map((field) => ({
      [field]: { contains: search, mode: 'insensitive' },
    }));
  }

  // date range filter
  if (startDate || endDate) {
    const field = dateField || 'createdAt';
    where[field] = {
      gte: new Date(startDate),
      lte: new Date(endDate),
    };
  }

  // pagination condition
  const isPaginated =
    page && pageSize && Number(page) > 0 && Number(pageSize) > 0;

  // main query
  const [data, total] = await Promise.all([
    (prisma[model] as any).findMany({
      where,
      ...(isPaginated && {
        skip: (Number(page) - 1) * Number(pageSize),
        take: Number(pageSize),
      }),
      orderBy: {
        createdAt: sortOrder,
      },
    }),
    (prisma[model] as any).count({ where }),
  ]);

  return {
    data,
    total,
    page: isPaginated ? Number(page) : null,
    pageSize: isPaginated ? Number(pageSize) : null,
    totalPages: isPaginated ? Math.ceil(total / Number(pageSize)) : null,
  };
}

//Function find all without pagination and search

export async function findAll<T extends keyof PrismaClient>(
  model: T,
  dto: PaginationSearchDto,
) {
  const { sortOrder, filters = {} } = dto;

  const where: any = { ...filters };

  if (where.isDeleted) {
    if (where.isDeleted == 'true') {
      where.isDeleted = true;
    } else {
      where.isDeleted = false;
    }
  }

  // main query
  const [data, total] = await Promise.all([
    (prisma[model] as any).findMany({
      where,
      orderBy: {
        createdAt: sortOrder,
      },
    }),
    (prisma[model] as any).count({ where }),
  ]);

  return {
    data,
    total,
  };
}
