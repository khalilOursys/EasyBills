import { PrismaClient } from '@prisma/client';
import { faker } from '@faker-js/faker';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  // 1. Create 5 roles
  const roleNames = ['ADMIN', 'USER', 'MANAGER', 'ACCOUNTANT', 'HR'];
  await prisma.role.createMany({
    data: roleNames.map((name) => ({ name })),
    skipDuplicates: true, // avoids unique constraint errors
  });

  const roles = await prisma.role.findMany();

  console.log(`✅ ${roles.length} Roles created`);

  // 2. Create 60 companies
  const companiesData = Array.from({ length: 60 }).map(() => ({
    name: faker.company.name(),
    taxId: 'TN' + faker.number.int({ min: 1000000, max: 9999999 }),
    tradeRegister: faker.string.alphanumeric(8).toUpperCase(),
    activity: faker.company.buzzPhrase(),
    manager: faker.person.fullName(),
    address: faker.location.streetAddress(),
    city: faker.location.city(),
    country: faker.location.country(),
    zipCode: faker.location.zipCode('#####'),
    phone: faker.phone.number({ style: 'international' }),
    fax: faker.datatype.boolean()
      ? faker.phone.number({ style: 'international' })
      : null,
    email: faker.internet.email().toLowerCase(),
    rib: faker.finance.iban({ formatted: false }),
    bankName: faker.company.name(),
  }));

  await prisma.company.createMany({
    data: companiesData,
    skipDuplicates: true,
  });

  const companies = await prisma.company.findMany();

  console.log(`✅ ${companies.length} Companies created`);

  // 3. Create 100 users
  const passwordHash = await bcrypt.hash('password123', 10);

  const usersData = Array.from({ length: 100 }).map(() => {
    const randomRole = roles[Math.floor(Math.random() * roles.length)];
    const randomCompany =
      companies[Math.floor(Math.random() * companies.length)];
    return {
      name: faker.person.fullName(),
      email: faker.internet.email().toLowerCase(),
      password: passwordHash,
      tel: faker.phone.number({ style: 'international' }),
      roleId: randomRole.id,
      // 👇 assigning each user randomly to companies
      company: {
        connect: { id: randomCompany.id },
      },
    };
  });

  // `createMany` does not support nested relations (company connect),
  // so we loop with `create`
  for (const user of usersData) {
    const { company, ...userData } = user;
    await prisma.user.create({
      data: {
        ...userData,
        company: company ? { connect: { id: company.connect.id } } : undefined,
      },
    });
  }

  console.log('✅ 100 Users created with random roles & companies');
}

main()
  .then(async () => {
    console.log('🎉 Seeding completed successfully');
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error('❌ Seeding failed', e);
    await prisma.$disconnect();
    process.exit(1);
  });
