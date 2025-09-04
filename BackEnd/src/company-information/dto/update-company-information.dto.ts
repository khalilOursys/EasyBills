import { PartialType } from '@nestjs/mapped-types';
import { CreateCompanyInformationDto } from './create-company-information.dto';

export class UpdateCompanyInformationDto extends PartialType(CreateCompanyInformationDto) {}
