import { Module} from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
import { join } from 'path';
import { typeOrmConfig } from './config/database.config';
import { MailerModule } from '@nestjs-modules/mailer';
import { RoleModule } from './role/role.module';
import { NotificationModule } from './notification/notification.module';
import { ProductModule } from './product/product.module';
import { CategoryModule } from './category/category.module';
import { DriverModule } from './driver/driver.module';
import { CarModule } from './car/car.module';
import { BankModule } from './bank/bank.module';
import { BankOperationModule } from './bankoperation/bank-operation.module';
import { SupplierModule } from './supplier/supplier.module';
import { PrismaModule } from './prisma/prisma.module';

@Module({
  imports: [
    TypeOrmModule.forRoot(typeOrmConfig),
    RoleModule,
    UserModule,
    AuthModule,
    MailerModule,
    NotificationModule,
    ProductModule,
    CategoryModule,
    DriverModule,
    CarModule,
    BankModule,
    BankOperationModule,
    SupplierModule,PrismaModule
  ],
})
export class AppModule {}
