import { Module} from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CompanyModule } from './modules/company/company.module';
import { UserModule } from './modules/user/user.module';
import { RoleModule } from './modules/role/role.module';
import { AuthModule } from './modules/auth/auth.module';
@Module({
  imports: [
   PrismaModule,CompanyModule, UserModule, RoleModule, AuthModule
  ],
   controllers: [AppController],providers:[AppService]
})
export class AppModule {}
