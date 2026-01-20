import { PrismaClient } from '@prisma/client';
import { seedDangerCategories } from '../prisma/seeds/danger-categories';
import { seedDangerousSituations } from '../prisma/seeds/dangerous-situations';

const prisma = new PrismaClient();

async function main() {
  try {
    console.log('🌱 Starting seed for dangerous situations...\n');
    
    // 1. Seed danger categories
    await seedDangerCategories();
    console.log('');
    
    // 2. Seed dangerous situations
    await seedDangerousSituations();
    console.log('');
    
    console.log('✅ Seed completed successfully!');
  } catch (error) {
    console.error('❌ Error during seed:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
