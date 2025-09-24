import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Patch,Query
} from '@nestjs/common';
import { CompanyService } from './company.service';
import { CreateCompanyDto } from './dto/create-company.dto';
import { PaginationSearchDto } from 'src/common/dto/pagination-search.dto';

@Controller('company')
export class CompanyController {
  constructor(private readonly service: CompanyService) {}

  @Post('addNewCompany')
  create(@Body() data: CreateCompanyDto) {
    return this.service.create(data);
  }

  @Get('findAll')
  findAllWithoutPaginationAndSearch(@Query() dto: PaginationSearchDto) {
    return this.service.findAll(dto);
  } 

  @Get('findAllWithPaginationAndSearch')
  findAllWithPaginationAndSearch(@Query() dto: PaginationSearchDto) {
    return this.service.findAllWithPaginationAndSearch(dto);
  }

  @Get('findById/:id')
  findById(@Param('id') id: string) {
    return this.service.findById(+id);
  }

  @Patch('update/:id')
  update(@Param('id') id: string, @Body() data: CreateCompanyDto) {
    return this.service.update(+id, data);
  }

  @Delete('delete/:id')
  remove(@Param('id') id: string) {
    return this.service.remove(+id);
  }

  @Patch('restore/:id')
  restore(@Param('id') id: string) {
    return this.service.restore(+id);
  }
}


