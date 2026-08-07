/**
 * Seed script for Kenya Governance Explorer
 *
 * Imports data from static TypeScript files and inserts into Prisma/SQLite.
 * Run: npx tsx prisma/seed.ts
 */

import { PrismaClient } from '@prisma/client';
import { all47Governors } from '../src/data/governors';
import { countyLeadershipData } from '../src/data/county-leadership';
import { countyAuditData } from '../src/data/county-audit-data';
import { countyBudgetData } from '../src/data/county-budget-data';
import { countyProjects } from '../src/data/county-projects';

const prisma = new PrismaClient({
  datasourceUrl: process.env.DATABASE_URL,
});

async function main() {
  console.log('Seeding Kenya Governance Explorer database...');

  // Seed counties and governors
  for (const governor of all47Governors) {
    await prisma.county.upsert({
      where: { code: governor.code },
      update: {},
      create: {
        id: governor.code,
        code: governor.code,
        name: governor.county,
        region: governor.region,
        capital: governor.capital,
        population: governor.population,
        areaSqKm: governor.areaSqKm,
        constituencies: governor.constituenciesCount,
        wards: governor.wardsCount,
        governor: {
          create: {
            fullName: governor.name,
            party: governor.party,
            coalition: governor.coalition,
            termStart: new Date(governor.termStart),
            termEnd: new Date(governor.termEnd),
            countyCode: governor.code,
          },
        },
      },
    });
  }

  // Seed county leadership
  for (const leadership of countyLeadershipData) {
    await prisma.countyLeadership.upsert({
      where: { countyCode: leadership.countyCode },
      update: {},
      create: leadership,
    });
  }

  // Seed audit records
  for (const audit of countyAuditData) {
    await prisma.countyAuditRecord.upsert({
      where: { id: audit.id },
      update: {},
      create: audit,
    });
  }

  // Seed budget records
  for (const budget of countyBudgetData) {
    await prisma.countyBudgetRecord.upsert({
      where: { id: budget.id },
      update: {},
      create: budget,
    });
  }

  // Seed projects
  for (const project of countyProjects) {
    await prisma.projectRecord.upsert({
      where: { id: project.id },
      update: {},
      create: project,
    });
  }

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
