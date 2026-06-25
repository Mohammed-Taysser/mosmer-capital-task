import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import 'dotenv/config';

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error('DATABASE_URL is not set');
}

const adapter = new PrismaPg(databaseUrl);
const prisma = new PrismaClient({ adapter });

async function main() {
  await prisma.stock.deleteMany({});

  // Seed sample products with operational stock
  await prisma.stock.createMany({
    data: [
      { id: 1, sku: 'SKU-101', quantity: 50 },
      { id: 2, sku: 'SKU-102', quantity: 10 },
      { id: 3, sku: 'SKU-103', quantity: 0 }, // Out of stock to test failure flow
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
