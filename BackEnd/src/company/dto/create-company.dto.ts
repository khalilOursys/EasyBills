import { IsString, IsOptional, IsEmail } from 'class-validator';

export class CreateCompanyDto {

  @IsString() 
  taxId: string;

  @IsString()
  tradeRegister: string;

  @IsString() 
  activity: string;

  @IsString() 
  manager: string;

  @IsString() 
  address: string;

  @IsString() 
  phone: string;

  @IsOptional() 
  @IsString() 
  fax?: string;

  @IsEmail() 
  email: string;

  @IsString() bankName: string;

  @IsString() 
  rib: string;
}

