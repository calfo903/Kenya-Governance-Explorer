/**
 * Seed / refresh real county projects only (OAG / CoB sourced).
 *
 * Prerequisites: counties must already exist (`npm run seed`).
 *
 *   npx tsx scripts/seed-projects.ts
 *   npm run seed:projects
 */

import { PrismaClient } from '@prisma/client';
import { countyProjects } from '../src/data/county-projects';

const prisma = new PrismaClient();

async function main() {
  console.log('\uD83C\uDFD7\uFE0F  Seeding real county projects...\n');

  const countyCount = await prisma.county.count();
  if (countyCount < 47) {
    console.warn(
      `\u26A0\uFE0F  Only ${countyCount}/47 counties in DB. Run \`npm run seed\` first for full FK coverage.`,
    );
  }

  const rows = countyProjects.filter((p) => p.countyCode !== '000');
  let created = 0;
  let updated = 0;
  let skipped = 0;

  for (const p of rows) {
    const county = await prisma.county.findUnique({ where: { id: p.countyCode } });
    if (!county) {
      console.log(`   skip ${p.id} \u2014 county ${p.countyCode} not found`);
      skipped++;
      continue;
    }

    const data = {
      name: p.name,
      countyCode: p.countyCode,
      category: p.category,
      status: p.status,
      budgetAllocated: p.budgetAllocated,
      budgetSpent: p.budgetSpent,
      auditOpinion: p.auditOpinion ?? null,
      riskScore: p.riskScore ?? 0,
    };

    const existing = await prisma.projectRecord.findUnique({ where: { id: p.id } });
    if (existing) {
      await prisma.projectRecord.update({ where: { id: p.id }, data });
      updated++;
    } else {
      await prisma.projectRecord.create({ data: { id: p.id, ...data } });
      created++;
    }
  }

  const total = await prisma.projectRecord.count();
  console.log(`\n\u2705 Done. created=${created} updated=${updated} skipped=${skipped} total_in_db=${total}`);
  console.log('   Source: src/data/county-projects.ts (OAG Summary FY 2024/25 + CoB BIR + public audit narratives)');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
