import { IsString } from 'class-validator';

export class CreateBankDto {
  @IsString()
  NameBank: string;

  @IsString()
  Agence: string;

  @IsString()
  Adress: string;

  @IsString()
  RIB: string;
}
