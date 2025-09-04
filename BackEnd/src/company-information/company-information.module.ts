import { Module } from '@nestjs/common';
import { CompanyInformationService } from './company-information.service';
import { CompanyInformationController } from './company-information.controller';

@Module({
  controllers: [CompanyInformationController],
  providers: [CompanyInformationService],
})
export class CompanyInformationModule {}
