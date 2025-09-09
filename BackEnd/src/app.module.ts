import { Module} from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CompanyModule } from './company/company.module';
import { UserModule } from './user/user.module';
import { RoleModule } from './role/role.module';
import { AuthModule } from './auth/auth.module';
@Module({
  imports: [
   PrismaModule,CompanyModule, UserModule, RoleModule, AuthModule
  ],
   controllers: [AppController],providers:[AppService]
})
export class AppModule {}
