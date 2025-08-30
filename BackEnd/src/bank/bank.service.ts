import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateBankDto } from './dto/create-bank.dto';
import { UpdateBankDto } from './dto/update-bank.dto';
import { Prisma } from '@prisma/client';
@Injectable()
export class BankService {
  constructor(private readonly prisma: PrismaService) {}

  create(data: CreateBankDto) {
    return this.prisma.bank.create({ data });
  }

  findAll() {
    return this.prisma.bank.findMany();
  }

  findOne(id: number) {
  //return this.prisma.bank.findUnique({ where: { id } });
  return this.prisma.bank.findUnique({
    where:{
       Idbank:id
    }
  })
  
  }

  update(id: number, data: UpdateBankDto) {
    return this.prisma.bank.update({ where: { Idbank:id }, data });
  
  }

  async remove(id: number) {
    const targetBank=await this.prisma.bank.findUnique({
      where:{
        Idbank:id
      }
    })
    console.log(targetBank)
    if(!targetBank){
      return "There is no bank that matcges this specific id"
    }else
    return this.prisma.bank.delete({ where: { Idbank:id } });
   
  }
}
