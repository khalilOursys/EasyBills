import { Module} from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CompanyInformationModule } from './company-information/company-information.module';
@Module({
  imports: [
   PrismaModule,CompanyInformationModule
  ],
   controllers: [AppController],providers:[AppService]
})
export class AppModule {}
