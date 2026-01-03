import {
  IsArray,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { SaleInvoiceType, InvoiceStatus } from '@prisma/client';

export class CreateSaleInvoiceItemDto {
  @IsInt()
  @IsNotEmpty()
  productId: number;

  @IsInt()
  @Min(1)
  quantity: number;

  @IsNumber()
  @Min(0)
  price: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  vatRate?: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  vatAmount?: number;
}

export class CreateSaleInvoiceDto {
  @IsString()
  @IsNotEmpty()
  invoiceNumber: string;

  @IsString()
  @IsNotEmpty()
  date: string | Date;

  @IsEnum(SaleInvoiceType)
  @IsOptional()
  type?: SaleInvoiceType;

  @IsEnum(InvoiceStatus)
  @IsOptional()
  status?: InvoiceStatus;

  @IsInt()
  @IsNotEmpty()
  clientId: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateSaleInvoiceItemDto)
  items: CreateSaleInvoiceItemDto[];

  @IsNumber()
  @Min(0)
  @IsOptional()
  totalHT?: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  totalTTC?: number;

  @IsString()
  @IsOptional()
  pdfUrl?: string;
}
