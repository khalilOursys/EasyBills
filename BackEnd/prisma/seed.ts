import {
  PrismaClient,
  UserRole,
  PurchaseInvoiceType,
  SaleInvoiceType,
  InvoiceStatus,
  PaymentMethod,
} from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  // Clean existing data (order matters due to foreign key constraints)
  await prisma.purchaseInvoiceItem.deleteMany();
  await prisma.saleInvoiceItem.deleteMany();
  await prisma.purchaseInvoice.deleteMany();
  await prisma.saleInvoice.deleteMany();
  await prisma.product.deleteMany();
  await prisma.supplier.deleteMany();
  await prisma.client.deleteMany();
  await prisma.category.deleteMany();
  await prisma.user.deleteMany();
  await prisma.companySettings.deleteMany();

  console.log('🗑️  Cleaned existing data');

  // Hash passwords
  const hashedPasswords = {
    admin: await bcrypt.hash('Admin123!', 10),
    commercial1: await bcrypt.hash('Commercial123!', 10),
    commercial2: await bcrypt.hash('Commercial456!', 10),
  };

  // Create Users
  const users = await prisma.user.createMany({
    data: [
      {
        email: 'admin@company.com',
        password: hashedPasswords.admin,
        role: UserRole.ADMIN,
      },
      {
        email: 'commercial1@company.com',
        password: hashedPasswords.commercial1,
        role: UserRole.COMMERCIAL,
      },
      {
        email: 'commercial2@company.com',
        password: hashedPasswords.commercial2,
        role: UserRole.COMMERCIAL,
      },
    ],
  });
  console.log('👥 Created 3 users');

  // Create Company Settings
  await prisma.companySettings.create({
    data: {
      companyName: 'TechCorp SARL',
      address: '123 Business Street, Casablanca, Morocco',
      phone: '+212 5 22 33 44 55',
      taxNumber: '12345678',
    },
  });
  console.log('🏢 Created company settings');

  // Create Categories
  const categories = await prisma.category.createMany({
    data: [
      {
        name: 'Électronique',
        description: 'Produits électroniques et gadgets',
      },
      {
        name: 'Informatique',
        description: 'Ordinateurs, périphériques et accessoires',
      },
      {
        name: 'Bureau',
        description: 'Fournitures de bureau et papeterie',
      },
    ],
  });
  console.log('📂 Created 3 categories');

  // Get categories for relationships
  const categoryList = await prisma.category.findMany();

  // Create Clients
  const clients = await prisma.client.createMany({
    data: [
      {
        name: 'Entreprise ABC SARL',
        phone: '+212 6 11 22 33 44',
        address: '45 Rue Mohammed V, Rabat',
        taxNumber: '87654321',
      },
      {
        name: 'Société XYZ SA',
        phone: '+212 6 55 66 77 88',
        address: '89 Avenue Hassan II, Casablanca',
        taxNumber: '98765432',
      },
      {
        name: 'Magasin Electro Plus',
        phone: '+212 5 99 88 77 66',
        address: '12 Rue des Commerçants, Marrakech',
        taxNumber: '76543210',
      },
    ],
  });
  console.log('👤 Created 3 clients');

  // Create Suppliers
  const suppliers = await prisma.supplier.createMany({
    data: [
      {
        code: 'SUP001',
        name: 'Fournisseur Tech Global',
        taxNumber: '11111111',
        phone: '+212 5 11 22 33 44',
        address: '100 Avenue des Industries, Tanger',
        bankRib: '123456789012345678901234',
      },
      {
        code: 'SUP002',
        name: 'Distributeur Informatique Pro',
        taxNumber: '22222222',
        phone: '+212 5 44 33 22 11',
        address: '200 Boulevard Mohammed VI, Casablanca',
        bankRib: '234567890123456789012345',
      },
      {
        code: 'SUP003',
        name: 'Importateur Électronique',
        taxNumber: '33333333',
        phone: '+212 5 77 88 99 00',
        address: '300 Rue du Commerce, Rabat',
        bankRib: '345678901234567890123456',
      },
    ],
  });
  console.log('🏭 Created 3 suppliers');

  // Get clients and suppliers for relationships
  const clientList = await prisma.client.findMany();
  const supplierList = await prisma.supplier.findMany();

  // Create Products
  const products = await prisma.product.createMany({
    data: [
      {
        reference: 'PROD001',
        internalCode: 'INT001',
        name: 'Ordinateur Portable HP EliteBook',
        stock: 15,
        minStock: 5,
        purchasePrice: 8000,
        marginPercent: 25,
        salePrice: 10000,
        discount: 5,
        vat: 20,
        categoryId: categoryList[1].id, // Informatique
      },
      {
        reference: 'PROD002',
        internalCode: 'INT002',
        name: 'Smartphone Samsung Galaxy S24',
        stock: 30,
        minStock: 10,
        purchasePrice: 6000,
        marginPercent: 30,
        salePrice: 7800,
        discount: 0,
        vat: 20,
        categoryId: categoryList[0].id, // Électronique
      },
      {
        reference: 'PROD003',
        internalCode: 'INT003',
        name: 'Imprimante Multifonction Canon',
        stock: 8,
        minStock: 3,
        purchasePrice: 3000,
        marginPercent: 20,
        salePrice: 3600,
        discount: 10,
        vat: 20,
        categoryId: categoryList[1].id, // Informatique
      },
      {
        reference: 'PROD004',
        internalCode: 'INT004',
        name: 'Cahier de compte 200 pages',
        stock: 100,
        minStock: 50,
        purchasePrice: 25,
        marginPercent: 40,
        salePrice: 35,
        discount: 0,
        vat: 10,
        categoryId: categoryList[2].id, // Bureau
      },
      {
        reference: 'PROD005',
        internalCode: 'INT005',
        name: 'Tablette iPad 10ème génération',
        stock: 12,
        minStock: 4,
        purchasePrice: 4500,
        marginPercent: 28,
        salePrice: 5760,
        discount: 5,
        vat: 20,
        categoryId: categoryList[0].id, // Électronique
      },
      {
        reference: 'PROD006',
        internalCode: 'INT006',
        name: 'Stylos pack de 10',
        stock: 200,
        minStock: 100,
        purchasePrice: 15,
        marginPercent: 50,
        salePrice: 22.5,
        discount: 0,
        vat: 10,
        categoryId: categoryList[2].id, // Bureau
      },
    ],
  });
  console.log('📦 Created 6 products');

  // Get products for relationships
  const productList = await prisma.product.findMany();

  // Create Purchase Invoices
  const purchaseInvoice1 = await prisma.purchaseInvoice.create({
    data: {
      invoiceNumber: 'FAC-ACH-2024-001',
      date: new Date('2024-01-15'),
      type: PurchaseInvoiceType.PURCHASE_INVOICE,
      status: InvoiceStatus.PAID,
      supplierId: supplierList[0].id,
      totalHT: 20000,
      totalTTC: 24000,
      items: {
        create: [
          {
            quantity: 5,
            price: 8000,
            productId: productList[0].id,
          },
          {
            quantity: 10,
            price: 6000,
            productId: productList[1].id,
          },
        ],
      },
    },
  });

  const purchaseInvoice2 = await prisma.purchaseInvoice.create({
    data: {
      invoiceNumber: 'FAC-ACH-2024-002',
      date: new Date('2024-01-20'),
      type: PurchaseInvoiceType.PURCHASE_INVOICE,
      status: InvoiceStatus.VALIDATED,
      supplierId: supplierList[1].id,
      totalHT: 9000,
      totalTTC: 10800,
      items: {
        create: [
          {
            quantity: 3,
            price: 3000,
            productId: productList[2].id,
          },
        ],
      },
    },
  });

  const purchaseInvoice3 = await prisma.purchaseInvoice.create({
    data: {
      invoiceNumber: 'BC-2024-001',
      date: new Date('2024-01-25'),
      type: PurchaseInvoiceType.PURCHASE_ORDER,
      status: InvoiceStatus.DRAFT,
      supplierId: supplierList[2].id,
      totalHT: 13500,
      totalTTC: 16200,
      items: {
        create: [
          {
            quantity: 3,
            price: 4500,
            productId: productList[4].id,
          },
        ],
      },
    },
  });
  console.log('📥 Created 3 purchase invoices');

  // Create Sale Invoices
  const saleInvoice1 = await prisma.saleInvoice.create({
    data: {
      invoiceNumber: 'FAC-VTE-2024-001',
      date: new Date('2024-01-18'),
      type: SaleInvoiceType.SALE_INVOICE,
      status: InvoiceStatus.PAID,
      clientId: clientList[0].id,
      totalHT: 20000,
      totalTTC: 24000,
      items: {
        create: [
          {
            quantity: 2,
            price: 10000,
            productId: productList[0].id,
          },
        ],
      },
    },
  });

  const saleInvoice2 = await prisma.saleInvoice.create({
    data: {
      invoiceNumber: 'DEV-2024-001',
      date: new Date('2024-01-22'),
      type: SaleInvoiceType.QUOTATION,
      status: InvoiceStatus.DRAFT,
      clientId: clientList[1].id,
      totalHT: 23400,
      totalTTC: 28080,
      items: {
        create: [
          {
            quantity: 3,
            price: 7800,
            productId: productList[1].id,
          },
        ],
      },
    },
  });

  const saleInvoice3 = await prisma.saleInvoice.create({
    data: {
      invoiceNumber: 'BL-2024-001',
      date: new Date('2024-01-28'),
      type: SaleInvoiceType.DELIVERY_NOTE,
      status: InvoiceStatus.VALIDATED,
      clientId: clientList[2].id,
      totalHT: 7200,
      totalTTC: 8640,
      items: {
        create: [
          {
            quantity: 2,
            price: 3600,
            productId: productList[2].id,
          },
        ],
      },
    },
  });
  console.log('📤 Created 3 sale invoices');

  // Create Payments

  // Update product stock based on invoices
  // Purchase invoices increase stock
  const purchaseItems = await prisma.purchaseInvoiceItem.findMany({
    include: { product: true },
  });

  for (const item of purchaseItems) {
    await prisma.product.update({
      where: { id: item.productId },
      data: {
        stock: {
          increment: item.quantity,
        },
      },
    });
  }

  // Sale invoices decrease stock
  const saleItems = await prisma.saleInvoiceItem.findMany({
    include: { product: true },
  });

  for (const item of saleItems) {
    await prisma.product.update({
      where: { id: item.productId },
      data: {
        stock: {
          decrement: item.quantity,
        },
      },
    });
  }
  console.log('📊 Updated product stock based on invoices');

  console.log('✅ Seeding completed successfully!');
  console.log('🔑 Login credentials:');
  console.log('   Admin: admin@company.com / Admin123!');
  console.log('   Commercial 1: commercial1@company.com / Commercial123!');
  console.log('   Commercial 2: commercial2@company.com / Commercial456!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
