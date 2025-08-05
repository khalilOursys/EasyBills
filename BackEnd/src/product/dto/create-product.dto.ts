// src/products/dto/create-product.dto.ts
import { IsNotEmpty, IsString, IsNumber, IsOptional } from 'class-validator';

export class CreateProductDto {
  @IsNotEmpty()
  @IsString()
  productCode: string;

  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsString()
  designation: string;

  @IsNumber({ maxDecimalPlaces: 3 })
  purchasePriceExclVat: number;

  @IsNumber({ maxDecimalPlaces: 3 })
  purchasePriceInclVat: number;

  @IsNumber()
  vat: number;

  @IsNumber({ maxDecimalPlaces: 3 })
  salePriceExclVat: number;

  @IsNumber({ maxDecimalPlaces: 3 })
  salePriceInclVat: number;

  @IsNumber({ maxDecimalPlaces: 3 })
  margin: number;

  @IsNumber({ maxDecimalPlaces: 3 })
  discount: number;

  @IsNumber()
  stock: number;

  @IsNumber()
  safetyStock: number;

  @IsNumber()
  packaging: number;

  @IsNumber()
  weight: number;

  @IsOptional()
  photo: string;

  /* @IsString()
  category: string; */
}
