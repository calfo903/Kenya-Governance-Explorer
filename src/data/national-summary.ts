import { NationalSummary, AUDIT_OPINIONS } from './types';

/**
 * National Summary Statistics
 * Compiled from OAG and CoB reports
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
        unmodified: 1,
        qualified: 44,
        adverse: 2,
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
      avgDevelopmentAbsorption: 48,
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
 * Coalition Distribution among 47 Governors
 * Source: IEBC Official Results, August 2022 General Election
 */
export const governorCoalitionDistribution = {
  'Kenya Kwanza Alliance': 26,
  'Azimio la Umoja One Kenya Coalition': 18,
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
