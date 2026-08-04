/**
 * In-app OAG / CoB report catalog + structured findings (primary UX: in-app, not external PDF).
 */
import { countyAuditData, type CountyAuditRecord } from './county-audit-data';
import { countyBudgetData } from './county-budget-data';
import type { SourceCitation } from './types';

export type ReportKind = 'oag-summary' | 'oag-county' | 'cob-implementation' | 'cra-allocation';

export interface InAppReportSection {
  id: string;
  title: string;
  body: string;
  bullets?: string[];
}

export interface InAppReport {
  id: string;
  kind: ReportKind;
  title: string;
  financialYear: string;
  publishedLabel: string;
  source: SourceCitation;
  abstract: string;
  sections: InAppReportSection[];
  countyCodes: string[];
  opinionSummary?: {
    unqualified: number;
    qualified: number;
    adverse: number;
    disclaimer: number;
    unknown: number;
  };
}

function countOpinions(year: string) {
  const rows = countyAuditData.filter((r) => r.financialYear === year);
  const tally = { unqualified: 0, qualified: 0, adverse: 0, disclaimer: 0, unknown: 0 };
  for (const r of rows) {
    const op = (r.executiveOpinion || '').toLowerCase();
    if (op.includes('unqualified') || op === 'clean') tally.unqualified++;
    else if (op.includes('qualified')) tally.qualified++;
    else if (op.includes('adverse')) tally.adverse++;
    else if (op.includes('disclaimer')) tally.disclaimer++;
    else tally.unknown++;
  }
  return tally;
}

function topFindings(year: string, limit = 12): string[] {
  const findings: string[] = [];
  for (const r of countyAuditData.filter((x) => x.financialYear === year)) {
    for (const f of r.keyFindings ?? []) {
      findings.push(`${r.countyName}: ${f}`);
      if (findings.length >= limit) return findings;
    }
  }
  return findings;
}

const OAG_SRC: SourceCitation = {
  id: 'oag-fy2425',
  name: 'OAG — County Governments Audit Report FY 2024/25',
  url: 'https://www.oagkenya.go.ke/',
  publisher: 'Office of the Auditor-General',
  accessedDate: '2026-08',
};

const COB_SRC: SourceCitation = {
  id: 'cob-fy2425',
  name: 'Controller of Budget — County Governments Budget Implementation',
  url: 'https://cob.go.ke/',
  publisher: 'Controller of Budget',
  accessedDate: '2026-08',
};

/** Official national aggregates (OAG FY 2024/25 + CoB absorption). */
export const inAppReports: InAppReport[] = [
  {
    id: 'oag-summary-2024-25',
    kind: 'oag-summary',
    title: 'OAG County Governments — National Summary FY 2024/25',
    financialYear: 'FY 2024/25',
    publishedLabel: 'Auditor-General (structured in-app)',
    source: OAG_SRC,
    abstract:
      'Executive: 1 unmodified (Makueni), 44 qualified, 2 adverse (Kericho, Tana River). Assemblies: 9 unmodified. Primary UX is this structured feed; PDF is citation only.',
    countyCodes: [],
    opinionSummary: {
      unqualified: 1,
      qualified: 44,
      adverse: 2,
      disclaimer: 0,
      unknown: 0,
    },
    sections: [
      {
        id: 'opinions',
        title: 'Audit opinions (Executive)',
        body: 'Official OAG FY 2024/25 county executive opinion mix.',
        bullets: [
          'Unmodified (clean): Makueni only (1)',
          'Qualified: 44 county executives',
          'Adverse: Kericho, Tana River (2)',
          'Assemblies unmodified: 9',
        ],
      },
      {
        id: 'findings',
        title: 'Sample key findings (from structured county rows)',
        body: 'Illustrative findings pulled from in-app audit records.',
        bullets: topFindings('FY 2024/25'),
      },
      {
        id: 'action',
        title: 'What citizens can do',
        body: 'Use RTI for project files, ask MCAs to table PAC reports, cross-check CoB absorption for the same FY.',
        bullets: [
          'Request project status reports via Access to Information Act',
          'Track pending bills vs development absorption on CoB reports',
          'Escalate material irregularities with evidence to EACC / OAG',
        ],
      },
    ],
  },
  {
    id: 'cob-impl-2024-25',
    kind: 'cob-implementation',
    title: 'CoB Budget Implementation Snapshot FY 2024/25',
    financialYear: 'FY 2024/25',
    publishedLabel: 'Controller of Budget (structured in-app)',
    source: COB_SRC,
    abstract:
      'National development absorption ~57%; overall ~78%. Use county cards for local rates.',
    countyCodes: [],
    sections: [
      {
        id: 'absorption',
        title: 'Absorption (national)',
        body: 'Latest CoB-aligned national aggregates used in this explorer.',
        bullets: [
          'Overall absorption ~78%',
          'Development absorption ~57%',
          'Recurrent typically much higher than development',
          'Low development absorption counties warrant project-level scrutiny',
        ],
      },
    ],
  },
  {
    id: 'oag-summary-2023-24',
    kind: 'oag-summary',
    title: 'OAG County Governments — FY 2023/24 (structured)',
    financialYear: 'FY 2023/24',
    publishedLabel: 'From in-app audit rows',
    source: OAG_SRC,
    abstract: 'Prior-year opinion mix derived from structured county audit records.',
    countyCodes: [],
    opinionSummary: countOpinions('FY 2023/24'),
    sections: [
      {
        id: 'findings',
        title: 'Sample findings',
        body: 'From structured records.',
        bullets: topFindings('FY 2023/24'),
      },
    ],
  },
];

export function buildCountyReportCard(countyCode: string): InAppReport | null {
  const audits = countyAuditData.filter((r) => r.countyCode === countyCode);
  if (!audits.length) return null;
  const name = audits[0].countyName;
  const latest = [...audits].sort((a, b) =>
    a.financialYear < b.financialYear ? 1 : -1,
  )[0];
  const budgets = countyBudgetData.filter((b) => b.countyCode === countyCode);

  return {
    id: `county-card-${countyCode}`,
    kind: 'oag-county',
    title: `${name} — Audit & Fiscal Card`,
    financialYear: latest.financialYear,
    publishedLabel: 'Generated from OAG/CoB structured data',
    source: latest.source,
    abstract: `${name} executive opinion (${latest.financialYear}): ${latest.executiveOpinion ?? 'n/a'}. Assembly: ${latest.assemblyOpinion ?? 'n/a'}.`,
    countyCodes: [countyCode],
    sections: [
      {
        id: 'opinions',
        title: 'Audit opinions by year',
        body: 'Executive and assembly opinions from structured OAG-derived records.',
        bullets: audits.map(
          (a) =>
            `${a.financialYear}: executive=${a.executiveOpinion ?? 'n/a'}; assembly=${a.assemblyOpinion ?? 'n/a'}`,
        ),
      },
      {
        id: 'findings',
        title: 'Key findings',
        body: 'As captured in the explorer dataset.',
        bullets: audits.flatMap((a) =>
          (a.keyFindings ?? []).map((f) => `${a.financialYear}: ${f}`),
        ),
      },
      {
        id: 'budget',
        title: 'Budget snapshot',
        body: budgets.length
          ? 'Absorption and pending bills from structured budget records.'
          : 'No budget rows for this county.',
        bullets: budgets.map(
          (b) =>
            `${b.financialYear}: total=${b.totalBudget.toLocaleString()} KES; dev absorption=${b.devAbsorptionRate}%; pending bills=${b.pendingBills.toLocaleString()} KES`,
        ),
      },
    ],
  };
}

export function listReports(): InAppReport[] {
  return inAppReports;
}

export function getReport(id: string): InAppReport | undefined {
  return inAppReports.find((r) => r.id === id);
}

export function getCountyAuditRows(countyCode: string): CountyAuditRecord[] {
  return countyAuditData.filter((r) => r.countyCode === countyCode);
}
