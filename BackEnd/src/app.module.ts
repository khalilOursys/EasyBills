import { AppController } from './app.controller';
import { PrismaService } from './prisma.service';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { ProductsModule } from './products/products.module';
import { CategoriesModule } from './categories/categories.module';
import { Module } from '@nestjs/common';
import { ClientsModule } from './clients/clients.module';
import { SuppliersModule } from './suppliers/suppliers.module';
import { PurchaseInvoiceModule } from './purchase-invoice/purchase-invoice.module';
import { SaleInvoiceModule } from './sale-invoice/sale-invoice.module';
import { PaymentsModule } from './payments/payments.module';

@Module({
  imports: [
    AuthModule,
    UsersModule,
    ProductsModule,
    CategoriesModule,
    ClientsModule,
    SuppliersModule,
    PurchaseInvoiceModule,
    SaleInvoiceModule,
    PaymentsModule,
  ],
  controllers: [AppController],
  providers: [PrismaService],
})
export class AppModule {}
