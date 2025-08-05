// create-supplier.dto.ts
import { IsString, IsEmail } from 'class-validator';

export class CreateSupplierDto {
  @IsString()
  code: string;

  @IsString()
  name: string;

  @IsString()
  address: string;

  @IsEmail()
  email: string;

  @IsString()
  phoneNumber: string;

  @IsString()
  coursDevis: string;

  @IsString()
  matriculeFiscale: string;
}
