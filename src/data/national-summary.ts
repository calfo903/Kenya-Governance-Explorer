import { NationalSummary, AUDIT_OPINIONS } from './types';

/**
 * National Summary Statistics
 * Compiled from OAG, CoB, CRA, and National Treasury reports
 *
 * DISCLAIMER: These figures are derived from publicly available reports.
 * Where exact figures differ between sources, the most recent official
 * report is used. All data should be cross-verified against original documents.
 *
 * Last verified: 2026-08-04
 */
export const nationalSummary: NationalSummary = {
  auditSummaries: [
    {
      financialYear: 'FY 2024/25',
      countyExecutive: {
        unmodified: 1,   // Makueni
        qualified: 44,
        adverse: 2,      // Kericho, Tana River — OAG Summary FY 2024/25
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
        accessedDate: '2026-08-04',
      },
    },
    {
      financialYear: 'FY 2023/24',
      countyExecutive: {
        unmodified: 0,
        qualified: 47,
        adverse: 0,
        disclaimer: 0,
      },
      countyAssembly: {
        unmodified: 8,
        qualified: 37,
        adverse: 2,
        disclaimer: 0,
      },
      source: {
        source: 'Office of the Auditor-General (OAG)',
        reportTitle: "Auditor-General's Summary Report on County Governments FY 2023/24",
        financialYear: 'FY 2023/24',
        url: 'https://www.oagkenya.go.ke/wp-content/uploads/2025/04/Auditor-Generals-summary-Report-on-County-Governments-2023-2024.pdf',
        section: 'Summary Report, Audit Opinion Tables',
        accessedDate: '2026-08-04',
      },
    },
    {
      financialYear: 'FY 2022/23',
      countyExecutive: {
        unmodified: 0,
        qualified: 41,
        adverse: 6,
        disclaimer: 0,
      },
      countyAssembly: {
        unmodified: 3,
        qualified: 41,
        adverse: 3,
        disclaimer: 0,
      },
      source: {
        source: 'Office of the Auditor-General (OAG)',
        reportTitle: "Auditor-General's Report on County Governments FY 2022/23",
        financialYear: 'FY 2022/23',
        url: 'https://www.oagkenya.go.ke/',
        section: 'County Government Audit Reports',
        accessedDate: '2026-08-04',
      },
    },
  ],
  budgetSummaries: [
    {
      financialYear: 'FY 2024/25',
      period: 'Full Year',
      avgDevelopmentAbsorption: 57,
      avgRecurrentAbsorption: 91,
      topPerformers: [
        { county: 'Nandi', rate: 90 },
        { county: 'Trans Nzoia', rate: 77 },
        { county: 'Narok', rate: 74 },
      ],
      bottomPerformers: [
        { county: 'Nairobi', rate: 29 },
        { county: 'Kisumu', rate: 29 },
        { county: 'Kiambu', rate: 37 },
      ],
      totalUnspentAmount: 'Development under-spend vs ~KES 219B approved',
      source: {
        source: 'Controller of Budget (CoB)',
        reportTitle: 'County Budget Implementation Review Report - FY 2024/25',
        financialYear: 'FY 2024/25',
        url: 'https://cob.go.ke/',
        section: 'County Budget Performance',
        accessedDate: '2026-08-04',
      },
    },
  ],
  lastUpdated: '2026-08-04',
};

export function getLatestAuditSummary() {
  return nationalSummary.auditSummaries[0];
}

export function getLatestBudgetSummary() {
  return nationalSummary.budgetSummaries[0];
}

export function getTotalCounties() {
  return 47;
}

export const totalCountiesAudited = 47;

export const nationalFiscalData = {
  equitableShare: {
    'FY 2024/25': {
      amount: 400.1,
      source: 'OAG / National Treasury equitable share reporting',
    },
  },
  ownSourceRevenue: {
    'FY 2024/25': {
      collectionTarget: 87.7,
      note: 'CoB: counties collected ~KES 67.3B OSR (~77% of target in reported figures)',
      source: 'Controller of Budget',
    },
  },
  avgDevelopmentAbsorptionRate: 57,
} as const;

export const governorCoalitionDistribution = {
  'Kenya Kwanza Alliance': 32,
  'Azimio la Umoja One Kenya Coalition': 12,
  Independent: 3,
};

export const governorPartyDistribution: Record<string, number> = {
  UDA: 22,
  ODM: 15,
  Wiper: 3,
  Independent: 3,
  UDA_Allied: 4,
  ODM_Allied: 0,
};
