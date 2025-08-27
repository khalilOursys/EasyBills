import { Injectable } from '@nestjs/common';
import { CreateBankDto } from './dto/create-bank.dto';
import { UpdateBankDto } from './dto/update-bank.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { DeepPartial, Repository } from 'typeorm';
import { Bank } from './entities/bank.entity';
import { NotFoundException } from '@nestjs/common';
@Injectable()
export class BankService {
  constructor(
    @InjectRepository(Bank)
    private bankRepository: Repository<Bank>,
  ) {}

  async create(createBankDto: CreateBankDto) {
    // Create a new bank entity from the DTO
    const bank = this.bankRepository.create(createBankDto as DeepPartial<Bank>);

    // Save it to the database
    return await this.bankRepository.save(bank);
  }

  async findAll() {
    const listBanks = await this.bankRepository.find();
    return listBanks;
  }

  async findOne(id: number) {
    //return `This action returns a ${id} bank`;
    const bank = await this.bankRepository.findOne({
      where: { Idbank: id },
    });
    if (!bank) {
      throw new NotFoundException(`Bank with ID ${id} not found`);
    }
    return bank;
  }

  async update(id: number, updateBankDto: UpdateBankDto) {
    const bank = await this.bankRepository.preload({
      Idbank: id,
      ...updateBankDto,
    });

    if (!bank) {
      throw new NotFoundException(`Bank with ID ${id} not found`);
    }

    return this.bankRepository.save(bank);
  }

  async remove(id: number) {
    const result = await this.bankRepository.delete({
      Idbank: id,
    });
    return result;
    
  }
}
