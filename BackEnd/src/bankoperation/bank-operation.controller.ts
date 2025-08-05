import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { BankOperationService } from './bank-operation.service';
import { CreateBankOperationDto } from './dto/create-bank-operation.dto';
import { UpdateBankOperationDto } from './dto/update-bank-operation.dto';

@Controller('bank-operation')
export class BankOperationController {
  constructor(private readonly bankOperationService: BankOperationService) {}

  @Post()
  create(@Body() createBankOperationDto: CreateBankOperationDto) {
    return this.bankOperationService.create(createBankOperationDto);
  }

  @Get()
  findAll() {
    return this.bankOperationService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.bankOperationService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateBankOperationDto: UpdateBankOperationDto) {
    return this.bankOperationService.update(+id, updateBankOperationDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.bankOperationService.remove(+id);
  }
}
