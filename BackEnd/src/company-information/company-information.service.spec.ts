import { Test, TestingModule } from '@nestjs/testing';
import { CompanyInformationService } from './company-information.service';

describe('CompanyInformationService', () => {
  let service: CompanyInformationService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CompanyInformationService],
    }).compile();

    service = module.get<CompanyInformationService>(CompanyInformationService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
