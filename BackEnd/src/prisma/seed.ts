import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {

  const bank1 = await prisma.bank.create({
    data: {
      NameBank: 'Bank One',
      Agence: 'Downtown Branch',
      Adress: '123 Main Street',
      RIB: 'RIB123456789'
    },
  }); 

  const bank2 = await prisma.bank.create({
    data: {
      NameBank: 'Bank Two',
      Agence: 'City Center',
      Adress: '456 City Avenue',
      RIB: 'RIB987654321'
    },
  }); 



  console.log('Seeding completed!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
