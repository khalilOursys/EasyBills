import { Test, TestingModule } from '@nestjs/testing';
import { CompanyInformationController } from './company-information.controller';
import { CompanyInformationService } from './company-information.service';

describe('CompanyInformationController', () => {
  let controller: CompanyInformationController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CompanyInformationController],
      providers: [CompanyInformationService],
    }).compile();

    controller = module.get<CompanyInformationController>(CompanyInformationController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
