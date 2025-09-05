import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
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
    try {
      const existing = await this.prisma.company.findFirst({
        where: { taxId: data.taxId },
      });

      if (existing) {
        return this.prisma.company.update({
          where: { id: existing.id },
          data,
        });
      } else {
        return this.prisma.company.create({ data });
      }
    } catch (error) {
      console.error('❌ Error in createOrUpdate():', error);
      throw new HttpException(
        'Failed to create or update company ',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async findAll() {
    try {
      return await this.prisma.company.findMany();
    } catch (error) {
      console.error('❌ Error in findAll():', error);
      throw new HttpException(
        {
          statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
          message: 'Failed to fetch company ',
          error: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async findById(id: number) {
    try {
      const existing = await this.prisma.company.findFirst({
        where: { id },
      });
      if (!existing) {
        throw new HttpException(
          `Company  with ID ${id} not found`,
          HttpStatus.NOT_FOUND,
        );
      }
      return existing;
    } catch (error) {
      if (!(error instanceof HttpException && error.getStatus() < 500)) {
        console.error('❌ Error in findById', error);
      }

      throw error;
    }
  }
  
  async remove(id: number) {
    try {
      const existing = await this.prisma.company.findFirst({
        where: { id },
      });

      if (!existing) {
        throw new HttpException(
          `Company  with ID ${id} not found`,
          HttpStatus.NOT_FOUND,
        );
      }

    await this.prisma.company.delete({ where: { id } });
    return {
      statusCode: HttpStatus.OK,
      message: `Company  with ID ${id} deleted successfully`,
    };
    } catch (error) {
      if (!(error instanceof HttpException && error.getStatus() < 500)) {
        console.error('❌ Error in remove:', error);
      }

      throw error;
    }
  }
}
