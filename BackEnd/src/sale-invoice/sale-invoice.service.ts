import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateSaleInvoiceDto } from './dto/create-sale-invoice.dto';
import { UpdateSaleInvoiceDto } from './dto/update-sale-invoice.dto';
import { FilterSaleInvoiceDto } from './dto/filter-sale-invoice.dto';
import { InvoiceStatus, SaleInvoiceType } from '@prisma/client';
import { UpdateStatusDto } from './dto/update-status.dto';

@Injectable()
export class SaleInvoiceService {
  constructor(private prisma: PrismaService) {}

  async create(createSaleInvoiceDto: CreateSaleInvoiceDto) {
    const { items, clientId, ...invoiceData } = createSaleInvoiceDto;

    // Check if client exists
    const client = await this.prisma.client.findUnique({
      where: { id: clientId },
    });

    if (!client) {
      throw new NotFoundException(`Client with ID ${clientId} not found`);
    }

    // Check if invoice number already exists
    const existingInvoice = await this.prisma.saleInvoice.findFirst({
      where: { invoiceNumber: invoiceData.invoiceNumber },
    });

    if (existingInvoice) {
      throw new BadRequestException('Invoice number already exists');
    }

    // Check if all products exist
    for (const item of items) {
      const product = await this.prisma.product.findUnique({
        where: { id: item.productId },
      });

      if (!product) {
        throw new NotFoundException(
          `Product with ID ${item.productId} not found`,
        );
      }
    }

    // Calculate VAT and totals
    let totalHT = 0;
    let totalTTC = 0;
    const calculatedItems = items.map((item) => {
      const vatRate = item.vatRate || 0; // Default VAT rate 19%
      const itemTotalHT = item.price * item.quantity;
      const itemVatAmount = itemTotalHT * (vatRate / 100);
      const itemTotalTTC = itemTotalHT + itemVatAmount;

      totalHT += itemTotalHT;
      totalTTC += itemTotalTTC;

      return {
        ...item,
        vatRate,
        vatAmount: itemVatAmount,
      };
    });

    // Use provided totals or calculated ones
    totalHT = createSaleInvoiceDto.totalHT || totalHT;
    totalTTC = createSaleInvoiceDto.totalTTC || totalTTC;

    // Create invoice with items in a transaction
    return this.prisma.$transaction(async (prisma) => {
      const invoice = await prisma.saleInvoice.create({
        data: {
          ...invoiceData,
          date: new Date(invoiceData.date),
          totalHT,
          totalTTC,
          clientId,
          type: invoiceData.type || SaleInvoiceType.SALE_INVOICE,
          status: InvoiceStatus.DRAFT,
          items: {
            create: calculatedItems.map((item) => ({
              productId: item.productId,
              quantity: item.quantity,
              price: item.price,
              vatRate: item.vatRate,
              vatAmount: item.vatAmount,
            })),
          },
        },
        include: {
          client: true,
          items: {
            include: {
              product: true,
            },
          },
        },
      });

      // Update product stock (decrement for sale)
      for (const item of calculatedItems) {
        await prisma.product.update({
          where: { id: item.productId },
          data: {
            stock: {
              decrement: item.quantity,
            },
          },
        });
      }

      return invoice;
    });
  }

  async findAll(filterDto?: FilterSaleInvoiceDto) {
    const where: any = {};

    if (filterDto) {
      if (filterDto.startDate || filterDto.endDate) {
        where.date = {};
        if (filterDto.startDate) {
          where.date.gte = new Date(filterDto.startDate);
        }
        if (filterDto.endDate) {
          where.date.lte = new Date(filterDto.endDate);
        }
      }

      if (filterDto.status) {
        where.status = filterDto.status;
      }

      if (filterDto.type) {
        where.type = filterDto.type;
      }

      if (filterDto.invoiceNumber) {
        where.invoiceNumber = {
          contains: filterDto.invoiceNumber,
          mode: 'insensitive',
        };
      }

      if (filterDto.clientName) {
        where.client = {
          name: {
            contains: filterDto.clientName,
            mode: 'insensitive',
          },
        };
      }
    }

    return this.prisma.saleInvoice.findMany({
      where,
      include: {
        client: true,
        payments: true,
        items: {
          include: {
            product: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findOne(id: number) {
    const invoice = await this.prisma.saleInvoice.findUnique({
      where: { id },
      include: {
        client: true,
        items: {
          include: {
            product: true,
          },
        },
      },
    });

    if (!invoice) {
      throw new NotFoundException(`Sale invoice with ID ${id} not found`);
    }

    return invoice;
  }

  async findByInvoiceNumber(invoiceNumber: string) {
    const invoice = await this.prisma.saleInvoice.findFirst({
      where: { invoiceNumber },
      include: {
        client: true,
        items: {
          include: {
            product: true,
          },
        },
      },
    });

    if (!invoice) {
      throw new NotFoundException(
        `Sale invoice with number ${invoiceNumber} not found`,
      );
    }

    return invoice;
  }

  async findByClient(clientId: number) {
    const client = await this.prisma.client.findUnique({
      where: { id: clientId },
    });

    if (!client) {
      throw new NotFoundException(`Client with ID ${clientId} not found`);
    }

    return this.prisma.saleInvoice.findMany({
      where: { clientId },
      include: {
        client: true,
        items: {
          include: {
            product: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async update(id: number, updateSaleInvoiceDto: UpdateSaleInvoiceDto) {
    // Check if invoice exists
    const existingInvoice = await this.findOne(id);

    const { items, clientId, ...updateData } = updateSaleInvoiceDto;

    // If clientId is being updated, check if new client exists
    if (clientId) {
      const client = await this.prisma.client.findUnique({
        where: { id: clientId },
      });

      if (!client) {
        throw new NotFoundException(`Client with ID ${clientId} not found`);
      }
    }

    // If invoice number is being updated, check if it's unique
    if (
      updateData.invoiceNumber &&
      updateData.invoiceNumber !== existingInvoice.invoiceNumber
    ) {
      const invoiceWithSameNumber = await this.prisma.saleInvoice.findFirst({
        where: { invoiceNumber: updateData.invoiceNumber },
      });

      if (invoiceWithSameNumber) {
        throw new BadRequestException('Invoice number already exists');
      }
    }

    // Handle items update
    let itemsUpdate: any = undefined;
    if (items) {
      // Check if all products exist
      for (const item of items) {
        if (item.productId) {
          const product = await this.prisma.product.findUnique({
            where: { id: item.productId },
          });

          if (!product) {
            throw new NotFoundException(
              `Product with ID ${item.productId} not found`,
            );
          }
        }
      }

      // Calculate VAT for items
      const calculatedItems = items.map((item) => {
        const vatRate = item.vatRate || 0;
        const itemTotalHT = item.price * item.quantity;
        const vatAmount = itemTotalHT * (vatRate / 100);

        return {
          productId: item.productId,
          quantity: item.quantity,
          price: item.price,
          vatRate,
          vatAmount,
        };
      });

      // Calculate new totals
      const newTotalHT = calculatedItems.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0,
      );
      const newTotalTTC = calculatedItems.reduce(
        (sum, item) =>
          sum + item.price * item.quantity * (1 + item.vatRate / 100),
        0,
      );

      updateData.totalHT = newTotalHT;
      updateData.totalTTC = newTotalTTC;

      // Delete existing items and create new ones
      itemsUpdate = {
        deleteMany: {},
        create: calculatedItems,
      };

      // Update stock (rollback old stock and apply new)
      const oldItems = existingInvoice.items;

      // First, restore old stock
      for (const oldItem of oldItems) {
        await this.prisma.product.update({
          where: { id: oldItem.productId },
          data: {
            stock: {
              increment: oldItem.quantity,
            },
          },
        });
      }

      // Then decrement new stock
      for (const newItem of calculatedItems) {
        await this.prisma.product.update({
          where: { id: newItem.productId },
          data: {
            stock: {
              decrement: newItem.quantity,
            },
          },
        });
      }
    }

    // Convert date string to Date object if provided
    if (updateData.date) {
      updateData.date = new Date(updateData.date);
    }

    return this.prisma.saleInvoice.update({
      where: { id },
      data: {
        ...updateData,
        clientId,
        items: itemsUpdate,
      },
      include: {
        client: true,
        items: {
          include: {
            product: true,
          },
        },
      },
    });
  }

  async updateStatus(id: number, updateStatusDto: UpdateStatusDto) {
    const invoice = await this.findOne(id); // Check if invoice exists

    return this.prisma.saleInvoice.update({
      where: { id },
      data: {
        status: updateStatusDto.status,
      },
      include: {
        client: true,
        items: {
          include: {
            product: true,
          },
        },
      },
    });
  }

  async remove(id: number) {
    const invoice = await this.findOne(id); // Check if invoice exists

    return this.prisma.$transaction(async (prisma) => {
      // Restore product stock
      for (const item of invoice.items) {
        await prisma.product.update({
          where: { id: item.productId },
          data: {
            stock: {
              increment: item.quantity,
            },
          },
        });
      }

      // First, delete all items
      await prisma.saleInvoiceItem.deleteMany({
        where: { invoiceId: id },
      });

      // Then delete the invoice
      return prisma.saleInvoice.delete({
        where: { id },
      });
    });
  }

  async getStatistics() {
    const totalInvoices = await this.prisma.saleInvoice.count();
    const totalAmount = await this.prisma.saleInvoice.aggregate({
      _sum: {
        totalTTC: true,
      },
    });
    const draftInvoices = await this.prisma.saleInvoice.count({
      where: { status: 'DRAFT' },
    });
    const paidInvoices = await this.prisma.saleInvoice.count({
      where: { status: 'PAID' },
    });

    const monthlyStats = await this.prisma.saleInvoice.groupBy({
      by: ['date'],
      _sum: {
        totalTTC: true,
      },
      where: {
        date: {
          gte: new Date(
            new Date().getFullYear(),
            new Date().getMonth() - 11,
            1,
          ),
        },
      },
      orderBy: {
        date: 'asc',
      },
    });

    return {
      totalInvoices,
      totalAmount: totalAmount._sum.totalTTC || 0,
      draftInvoices,
      paidInvoices,
      monthlyStats,
    };
  }
}
