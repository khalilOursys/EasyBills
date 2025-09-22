import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateCompanyDto } from './dto/create-company.dto';
import { PaginationSearchDto } from 'src/common/dto/pagination-search.dto';
import { findAllWithSearchAndCriteria,findAll } from 'src/common/helpers/find-all.helper';
import { UpdateCompanyDto } from './dto/update-company.dto';
@Injectable()
export class CompanyService {
  constructor(private prisma: PrismaService) {}

  async create(data: CreateCompanyDto) {
    const newCompany = await this.prisma.safeExecute(
      this.prisma.company.create({ data }),
    );
    return this.prisma.successResponse(newCompany);
  }

  async findAll(dto: PaginationSearchDto) {
    const companies = await this.prisma.safeExecute(
      findAll('company',dto)
    );
    return this.prisma.successResponse(companies);
  }

  async findAllWithPaginationAndSearch(dto: PaginationSearchDto) {
    const companies = await this.prisma.safeExecute(
      findAllWithSearchAndCriteria('company', dto, [
        'name',
        'email',
        'taxId',
        'manager',
        'activity',
        'address',
        'bankName',
        'country',
        'city',
        'rib',
      ]),
    );

    return this.prisma.successResponse(companies);
  }

  async findById(id: number) {
    const company = await this.prisma.safeExecute(
      this.prisma.company.findUniqueOrThrow({ where: { id } }),
    );
    return this.prisma.successResponse(company);
  }

  async update(id: number, data: UpdateCompanyDto) {
    const updatedCompany = await this.prisma.safeExecute(
      this.prisma.company.update({ where: { id }, data }),
    );
    return this.prisma.successResponse(updatedCompany);
  }

  //Soft delete
  async remove(id: number) {
    await this.prisma.safeExecute(
      this.prisma.company.update({
        where: { id },
        data: { isDeleted: true },
      }),
    );
    return this.prisma.successResponse({ message: 'Company soft deleted' });
  }

  //Restore soft deleted company
  async restore(id: number) {
    await this.prisma.safeExecute(
      this.prisma.company.update({
        where: { id },
        data: { isDeleted: false },
      }),
    );
    return this.prisma.successResponse({ message: 'Company restored' });
  }
}
