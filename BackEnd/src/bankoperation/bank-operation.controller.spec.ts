import { Test, TestingModule } from '@nestjs/testing';
import { BankOperationController } from './bank-operation.controller';
import { BankOperationService } from './bank-operation.service';

describe('BankOperationController', () => {
  let controller: BankOperationController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BankOperationController],
      providers: [BankOperationService],
    }).compile();

    controller = module.get<BankOperationController>(BankOperationController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
