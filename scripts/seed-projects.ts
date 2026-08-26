/**
 * Seed / refresh real county projects only (OAG / CoB sourced).
 *
 * Prerequisites: counties must already exist (npm run seed).
 *
 *   npx tsx scripts/seed-projects.ts
 *   npm run seed:projects
 */

import { PrismaClient } from '@prisma/client';
import { countyProjects } from '../src/data/county-projects';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding real county projects...');

  const countyCount = await prisma.county.count();
  console.log('Found', countyCount, 'counties in database.');

  if (countyCount === 0) {
    console.error('No counties found. Please run npm run seed first.');
    process.exit(1);
  }

  for (const project of countyProjects) {
    await prisma.projectRecord.upsert({
      where: { id: project.id },
      update: {},
      create: project,
    });
  }

  console.log('Seeding projects completed!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });