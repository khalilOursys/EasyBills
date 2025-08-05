import { Module } from '@nestjs/common';
import { BankOperationService } from './bank-operation.service';
import { BankOperationController } from './bank-operation.controller';

@Module({
  controllers: [BankOperationController],
  providers: [BankOperationService],
})
export class BankOperationModule {}
