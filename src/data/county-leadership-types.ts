/**
 * Type definitions for County Leadership data.
 * Extracted from county-leadership.ts for modularity (§1.3 Complexity Control).
 */

export interface CECMMember {
  portfolio: string;
  name: string;
  qualification?: string;
}

export interface WardMember {
  name: string;
  mca: string;
}

export interface ConstituencyData {
  name: string;
  code: string;
  mp: { name: string; party: string };
  wards: WardMember[];
}

export interface ExpenseBreakdown {
  health: number;
  education: number;
  infrastructure: number;
  agriculture: number;
  administration: number;
  other: number;
}

export interface FinancialData {
  equitableShare: number;
  ownSourceRevenue: number;
  conditionalGrants: number;
  totalBudget: number;
  developmentBudget: number;
  recurrentBudget: number;
  devAbsorptionRate: number;
  recurrentAbsorptionRate: number;
  pendingBills: number;
  expenseBreakdown: ExpenseBreakdown;
}

export interface AuditData {
  opinion: string;
  financialYear: string;
  findings: string[];
  source: string;
}

export interface CountyLeadershipData {
  countyCode: string;
  countyName: string;
  region: string;
  governor: { name: string; party: string; coalition: string; termStart: string; termEnd: string };
  deputyGovernor: { name: string; party: string };
  senator: { name: string; party: string; coalition: string };
  womanRep: { name: string; party: string; coalition: string };
  cecms: CECMMember[];
  assemblySpeaker: { name: string; party: string };
  constituencies: ConstituencyData[];
  financial: FinancialData;
  audit: AuditData;
}
