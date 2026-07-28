import { NationalSummary, AUDIT_OPINIONS } from './types';

/**
 * National Summary Statistics
 * Compiled from OAG, CoB, CRA, and National Treasury reports
 *
 * DISCLAIMER: These figures are derived from publicly available reports.
 * Where exact figures differ between sources, the most recent official
 * report is used. All data should be cross-verified against original documents.
 */
export const nationalSummary: NationalSummary = {
  auditSummaries: [
    {
      financialYear: 'FY 2024/25',
      countyExecutive: {
        unmodified: 1,   // Makueni
        qualified: 44,
        adverse: 2,      // Meru, Embu
        disclaimer: 0,
      },
      countyAssembly: {
        unmodified: 9,
        qualified: 38,
        adverse: 0,
        disclaimer: 0,
      },
      source: {
        source: 'Office of the Auditor-General (OAG)',
        reportTitle: "Auditor-General's Summary Report on County Governments FY 2024/25",
        financialYear: 'FY 2024/25',
        url: 'https://www.oagkenya.go.ke/wp-content/uploads/2026/05/AUDITOR-GENERALS-SUMMARY-REPORT-ON-COUNTY-GOVERNMENTS-2024-2025.pdf',
        section: 'Summary Report, County Executive Audit Opinions',
        accessedDate: '2026-07-25',
      },
    },
    {
      financialYear: 'FY 2023/24',
      countyExecutive: {
        unmodified: 0,
        qualified: 44,
        adverse: 3,
        disclaimer: 0,
      },
      countyAssembly: {
        unmodified: 8,
        qualified: 39,
        adverse: 0,
        disclaimer: 0,
      },
      source: {
        source: 'Office of the Auditor-General (OAG)',
        reportTitle: "Auditor-General's Summary Report on County Governments FY 2023/24",
        financialYear: 'FY 2023/24',
        url: 'https://www.oagkenya.go.ke/wp-content/uploads/2025/04/Auditor-Generals-summary-Report-on-County-Governments-2023-2024.pdf',
        section: 'Summary Report, Audit Opinion Tables',
        accessedDate: '2026-07-25',
      },
    },
    {
      financialYear: 'FY 2022/23',
      countyExecutive: {
        unmodified: 3,
        qualified: 38,
        adverse: 6,
        disclaimer: 0,
      },
      countyAssembly: {
        unmodified: 7,
        qualified: 36,
        adverse: 2,
        disclaimer: 2,
      },
      source: {
        source: 'Office of the Auditor-General (OAG)',
        reportTitle: "Auditor-General's Report on County Governments FY 2022/23",
        financialYear: 'FY 2022/23',
        url: 'https://www.oagkenya.go.ke/reports/county-government-audit-reports/',
        section: 'Individual County Reports Compilation',
        accessedDate: '2026-07-25',
      },
    },
  ],
  budgetSummaries: [
    {
      financialYear: 'FY 2025/26',
      period: 'Half-Year (July 2025 - December 2025)',
      avgDevelopmentAbsorption: 14,
      avgRecurrentAbsorption: 72,
      topPerformers: [
        { county: 'Mandera', rate: 32 },
        { county: 'Marsabit', rate: 28 },
      ],
      bottomPerformers: [
        { county: 'Nairobi', rate: 3 },
        { county: 'Mombasa', rate: 5 },
        { county: 'Lamu', rate: 4 },
      ],
      source: {
        source: 'Controller of Budget (CoB)',
        reportTitle: 'County Budget Implementation Review Report - Half Year FY 2025/26',
        financialYear: 'FY 2025/26',
        url: 'https://cob.go.ke/county-budget-implementation-review-reports/',
        section: 'Development Budget Absorption Analysis',
        accessedDate: '2026-07-25',
      },
    },
    {
      financialYear: 'FY 2024/25',
      period: 'Full Year',
      avgDevelopmentAbsorption: 45,
      avgRecurrentAbsorption: 89,
      topPerformers: [
        { county: 'Mandera', rate: 78 },
        { county: 'Marsabit', rate: 74 },
        { county: 'Makueni', rate: 72 },
      ],
      bottomPerformers: [
        { county: 'Nairobi', rate: 22 },
        { county: 'Mombasa', rate: 28 },
        { county: 'Turkana', rate: 31 },
      ],
      totalUnspentAmount: 'KSh 72 billion',
      source: {
        source: 'Controller of Budget (CoB)',
        reportTitle: 'County Budget Implementation Review Report - FY 2024/25',
        financialYear: 'FY 2024/25',
        url: 'https://cob.go.ke/county-budget-implementation-review-reports/',
        section: 'County Budget Performance Tables',
        accessedDate: '2026-07-25',
      },
    },
  ],
  lastUpdated: '2026-07-25',
};

/**
 * Key Statistics Helpers
 */
export function getLatestAuditSummary() {
  return nationalSummary.auditSummaries[0];
}

export function getLatestBudgetSummary() {
  return nationalSummary.budgetSummaries[0];
}

export function getTotalCounties() {
  return 47;
}

/**
 * Total counties audited by OAG (all 47 counties are audited each FY)
 */
export const totalCountiesAudited = 47;

/**
 * National Fiscal Data
 * Source: Commission on Revenue Allocation (CRA) & National Treasury
 */
export const nationalFiscalData = {
  equitableShare: {
    'FY 2024/25': {
      amount: 387.4, // KSh billion — actual disbursement
      source: 'National Treasury / Division of Revenue Act 2024',
    },
    'FY 2025/26': {
      amount: 415, // KSh billion — after Division of Revenue Amendment Act
      source: 'National Treasury / Division of Revenue Amendment Act 2025',
    },
    'FY 2025/26 (CRA Recommended)': {
      amount: 417.4, // KSh billion — CRA recommendation
      source: 'Commission on Revenue Allocation (CRA) Policy Recommendations',
    },
  },
  ownSourceRevenue: {
    'FY 2024/25': {
      collectionTarget: 45, // KSh billion — total county own-source revenue target
      note: 'Aggregate target across all 47 counties; actual collection typically falls short',
      source: 'Commission on Revenue Allocation / County Budget Estimates',
    },
  },
  avgDevelopmentAbsorptionRate: 45, // % — varies widely by county (some <10%, others >70%)
} as const;

/**
 * Coalition Distribution among 47 Governors
 * Source: IEBC Official Results, August 2022 General Election
 *
 * Note: Post-election defections have shifted the balance.
 * Kenya Kwanza Alliance gained several governors through defections
 * from Azimio la Umoja since the 2022 election.
 *
 * Current distribution (as of 2025):
 * - Kenya Kwanza Alliance: ~32 governors
 * - Azimio la Umoja: ~12 governors
 * - Independent: ~3 governors
 */
export const governorCoalitionDistribution = {
  'Kenya Kwanza Alliance': 32,
  'Azimio la Umoja One Kenya Coalition': 12,
  'Independent': 3,
};

/**
 * Party Distribution among 47 Governors
 * Source: IEBC Official Results, August 2022 General Election
 */
export const governorPartyDistribution: Record<string, number> = {
  UDA: 22,
  ODM: 15,
  Wiper: 3,
  Independent: 3,
  UDA_Allied: 4,
  ODM_Allied: 0,
};
