import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  await prisma.stock.deleteMany({});

  // Seed sample products with operational stock
  await prisma.stock.createMany({
    data: [
      { sku: 'SKU-101', quantity: 50 },
      { sku: 'SKU-102', quantity: 10 },
      { sku: 'SKU-103', quantity: 0 }, // Out of stock to test failure flow
    ],
  });
  console.log('Database seeded successfully with stock levels.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
