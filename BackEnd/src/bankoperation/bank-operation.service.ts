import { Injectable } from '@nestjs/common';
import { CreateBankOperationDto } from './dto/create-bank-operation.dto';
import { UpdateBankOperationDto } from './dto/update-bank-operation.dto';

@Injectable()
export class BankOperationService {
  create(createBankOperationDto: CreateBankOperationDto) {
    return 'This action adds a new bankOperation';
  }

  findAll() {
    return `This action returns all bankOperation`;
  }

  findOne(id: number) {
    return `This action returns a #${id} bankOperation`;
  }

  update(id: number, updateBankOperationDto: UpdateBankOperationDto) {
    return `This action updates a #${id} bankOperation`;
  }

  remove(id: number) {
    return `This action removes a #${id} bankOperation`;
  }
}
