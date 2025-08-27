
import { IsString } from 'class-validator';
export class CreateBankDto {

    @IsString()
    nameBank: string;

    @IsString()
    agence: string;

    @IsString()
    address: string;

    @IsString()
    rib: string;
}
