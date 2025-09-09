import { Injectable} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCompanyDto } from './dto/create-company.dto';

@Injectable()
export class CompanyService {
  constructor(private prisma: PrismaService) {}

  /*
  *   This method ensures that company  is only created once.
  - If a record with the same unique taxId exists, it will be updated.
  - If no record exists, a new one will be created.
 */

  async createOrUpdate(data: CreateCompanyDto) {
    return this.prisma.safeExecute(
      (async () => {
        const existing = await this.prisma.company.findFirst({
          where: { taxId: data.taxId },
        });
        if (existing) {
          const updatedCompany = await this.prisma.company.update({
            where: { id: existing.id },
            data,
          });
          return this.prisma.successResponse(updatedCompany);
        } else {
          const newUser = await this.prisma.company.create({ data });
          return this.prisma.successResponse(newUser);
        }
      })(),
    );
  }

  async findAll() {
    const companies = await this.prisma.safeExecute(
      this.prisma.company.findMany(),
    );
    return this.prisma.successResponse(companies);
  }

  async findById(id: number) {
    const company = await this.prisma.safeExecute(
      this.prisma.company.findUniqueOrThrow({ where: { id } }),
    );
    return this.prisma.successResponse(company);
  }

  async remove(id: number) {
    await this.prisma.safeExecute(
      this.prisma.company.delete({ where: { id } }),
    );
    return this.prisma.successResponse({ message: 'Company deleted' });
  }
}
