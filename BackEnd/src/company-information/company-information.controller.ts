import { Controller, Get, Post, Body, Param, Patch, Delete } from '@nestjs/common';
import { CompanyInformationService } from './company-information.service';
import { CreateCompanyInformationDto } from './dto/create-company-information.dto';
import { UpdateCompanyInformationDto } from './dto/update-company-information.dto';

@Controller('companyInformation')
export class CompanyInformationController {
  constructor(private readonly service: CompanyInformationService) {}

  @Post()
  create(@Body() data: CreateCompanyInformationDto) {
    return this.service.createOrUpdate(data);
  }

  @Get()
  findAll() {
    return this.service.findAll();
  }

   @Delete(':id')
  remove(@Param('id') id: string) {
    return this.service.remove(+id);
  }
}
