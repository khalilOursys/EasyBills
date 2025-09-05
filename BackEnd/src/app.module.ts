import { Module} from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CompanyModule } from './company/company.module';
@Module({
  imports: [
   PrismaModule,CompanyModule
  ],
   controllers: [AppController],providers:[AppService]
})
export class AppModule {}
