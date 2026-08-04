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

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...\n');

  // Phase 1: Counties & Governors
  console.log('Phase 1: Seeding Counties & Governors...');
  const countyCount = await prisma.county.count();
  if (countyCount > 0) {
    console.log(`   ${countyCount} counties already exist. Skipping county/governor seed.`);
  } else {
    for (const gov of all47Governors) {
      await prisma.county.create({
        data: {
          id: gov.code,
          name: gov.county,
          code: gov.code,
          region: gov.region,
          capital: gov.capital,
          population: gov.population,
          areaSqKm: gov.areaSqKm,
          constituencies: gov.constituenciesCount,
          wards: gov.wardsCount,
          governor: {
            create: {
              fullName: gov.name,
              party: gov.party,
              coalition: gov.coalition,
              termStart: new Date(gov.termStart),
              termEnd: new Date(gov.termEnd),
            },
          },
        },
      });
    }
    console.log('   47 counties with governors seeded.');
  }

  // Phase 2: County Leadership
  console.log('Phase 2: Seeding County Leadership...');
  const leadershipCount = await prisma.countyLeadership.count();
  if (leadershipCount > 0) {
    console.log(`   ${leadershipCount} leadership records already exist. Skipping.`);
  } else {
    for (const ld of countyLeadershipData) {
      const countyExists = await prisma.county.findUnique({ where: { id: ld.countyCode } });
      if (!countyExists) {
        console.log(`   County ${ld.countyCode} (${ld.countyName}) not found. Skipping.`);
        continue;
      }

      await prisma.countyLeadership.create({
        data: {
          countyCode: ld.countyCode,
          deputyGovernor: ld.deputyGovernor.name,
          senator: ld.senator.name,
          womanRep: ld.womanRep.name,
          assemblySpeaker: ld.assemblySpeaker.name,
          cecms: {
            create: ld.cecms.map((c) => ({
              portfolio: c.portfolio,
              fullName: c.name,
              qualification: c.qualification ?? null,
            })),
          },
          mcas: {
            create: ld.constituencies.flatMap((con) =>
              con.wards.map((w) => ({
                constituency: con.name,
                ward: w.name,
                fullName: w.mca,
                party: null,
              })),
            ),
          },
        },
      });
    }
    console.log(`   ${countyLeadershipData.length} leadership records seeded.`);
  }

  // Phase 3: Audit Records
  console.log('Phase 3: Seeding Audit Records...');
  const auditCount = await prisma.countyAuditRecord.count();
  if (auditCount > 0) {
    console.log(`   ${auditCount} audit records already exist. Skipping.`);
  } else {
    const auditData = countyAuditData.map((a) => ({
      countyCode: a.countyCode,
      financialYear: a.financialYear,
      executiveOpinion: a.executiveOpinion ?? null,
      assemblyOpinion: a.assemblyOpinion ?? null,
      keyFindings: JSON.stringify(a.keyFindings ?? []),
    }));
    const BATCH_SIZE = 50;
    for (let i = 0; i < auditData.length; i += BATCH_SIZE) {
      const batch = auditData.slice(i, i + BATCH_SIZE);
      await prisma.countyAuditRecord.createMany({ data: batch });
    }
    console.log(`   ${auditData.length} audit records seeded.`);
  }

  // Phase 4: Budget Records
  console.log('Phase 4: Seeding Budget Records...');
  const budgetCount = await prisma.countyBudgetRecord.count();
  if (budgetCount > 0) {
    console.log(`   ${budgetCount} budget records already exist. Skipping.`);
  } else {
    const budgetData = countyBudgetData.map((b) => ({
      countyCode: b.countyCode,
      financialYear: b.financialYear,
      totalBudget: b.totalBudget,
      developmentBudget: b.developmentBudget,
      recurrentBudget: b.recurrentBudget,
      devAbsorptionRate: b.devAbsorptionRate,
      recurrentAbsorptionRate: b.recurrentAbsorptionRate,
      ownSourceRevenue: b.ownSourceRevenue,
      pendingBills: b.pendingBills,
    }));
    const BATCH_SIZE = 50;
    for (let i = 0; i < budgetData.length; i += BATCH_SIZE) {
      const batch = budgetData.slice(i, i + BATCH_SIZE);
      await prisma.countyBudgetRecord.createMany({ data: batch });
    }
    console.log(`   ${budgetData.length} budget records seeded.`);
  }

  // Phase 5: Real county projects (OAG / CoB)
  console.log('Phase 5: Seeding County Projects (real OAG/CoB data)...');
  const projectRows = countyProjects.filter((p) => p.countyCode !== '000');
  let created = 0;
  let updated = 0;
  let skipped = 0;

  for (const p of projectRows) {
    const countyExists = await prisma.county.findUnique({ where: { id: p.countyCode } });
    if (!countyExists) {
      console.log(`   County ${p.countyCode} missing — skip project ${p.id}`);
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
  console.log(`   Projects: ${created} created, ${updated} updated, ${skipped} skipped (${projectRows.length} eligible).`);

  // Summary
  const finalCounties = await prisma.county.count();
  const finalGovernors = await prisma.governor.count();
  const finalLeadership = await prisma.countyLeadership.count();
  const finalCecms = await prisma.countyCECM.count();
  const finalMcas = await prisma.countyMCA.count();
  const finalAudits = await prisma.countyAuditRecord.count();
  const finalBudgets = await prisma.countyBudgetRecord.count();
  const finalProjects = await prisma.projectRecord.count();

  console.log('\nSeed Complete!');
  console.log(`   Counties:    ${finalCounties}`);
  console.log(`   Governors:   ${finalGovernors}`);
  console.log(`   Leadership:  ${finalLeadership}`);
  console.log(`   CECMs:       ${finalCecms}`);
  console.log(`   MCAs:        ${finalMcas}`);
  console.log(`   Audits:      ${finalAudits}`);
  console.log(`   Budgets:     ${finalBudgets}`);
  console.log(`   Projects:    ${finalProjects}`);
}

main()
  .catch((e) => {
    console.error('Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
