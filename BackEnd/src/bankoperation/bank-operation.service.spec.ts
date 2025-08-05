import { Test, TestingModule } from '@nestjs/testing';
import { BankOperationService } from './bank-operation.service';

describe('BankOperationService', () => {
  let service: BankOperationService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [BankOperationService],
    }).compile();

    service = module.get<BankOperationService>(BankOperationService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
