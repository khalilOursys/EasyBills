import { IsString, IsOptional, IsEmail } from 'class-validator';

export class CreateCompanyDto {

  @IsString() 
  taxId: String;

  @IsString()
  tradeRegister: String;

  @IsString() 
  activity: String;

  @IsString() 
  manager: String;

  @IsString() 
  address: String;

  @IsString() 
  phone: String;

  @IsOptional() 
  @IsString() 
  fax?: String;

  @IsEmail() 
  email: String;

  @IsString() bankName: String;

  @IsString() 
  rib: String;
}

