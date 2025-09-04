import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCompanyInformationDto } from './dto/create-company-information.dto';
import { UpdateCompanyInformationDto } from './dto/update-company-information.dto';

@Injectable()
export class CompanyInformationService {
  constructor(private prisma: PrismaService) {}

/*
 
 *   This method ensures that company information is only created once.
  - If a record with the same unique taxId exists, it will be updated.
  - If no record exists, a new one will be created.
 */
  async createOrUpdate(data: CreateCompanyInformationDto) {
    try {
      const existing = await this.prisma.companyInformation.findFirst({
        where: { taxId: data.taxId },
      });

      if (existing) {
        return this.prisma.companyInformation.update({
          where: { id: existing.id },
          data,
        });
      } else {
        return this.prisma.companyInformation.create({ data });
      }
    } catch (error) {
      console.error('❌ Error in createOrUpdate():', error);
      throw new HttpException(
        'Failed to create or update company information',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async findAll() {
    try {
      return await this.prisma.companyInformation.findMany();
    } catch (error) {
      console.error('❌ Error in findAll():', error);
      throw new HttpException(
        {
          statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
          message: 'Failed to fetch company information',
          error: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

async remove(id: number) {
  try {
    const existing = await this.prisma.companyInformation.findFirst({
      where: { id },
    });

    if (!existing) {
    
      throw new HttpException(
        `Company information with ID ${id} not found`,
        HttpStatus.NOT_FOUND,
      );
    }

    
    return await this.prisma.companyInformation.delete({ where: { id } });
  } catch (error) {
    
    if (!(error instanceof HttpException && error.getStatus() < 500)) {
      console.error('❌ Error in remove:', error);
    }

   
    throw error;
  }
}

}
