/**
 * County Leadership Hierarchy & Financial Disbursement Data
 * All 47 Kenya Counties — 2022-2027 Term
 *
 * Sources:
 * - IEBC Official Results, August 2022 General Election
 * - Controller of Budget (CoB) County Budget Implementation Review Reports
 * - Office of the Auditor-General (OAG) of Kenya
 * - Cross-verified against Nation Africa, Standard, Business Daily
 *
 * NOTE: CECM names and MCA names are based on publicly available records.
 * Some ward-level MCA names may be approximate where official ward lists
 * were not fully disaggregated at press time.
 *
 * Modularized: types in county-leadership-types.ts, per-region data in regions/.
 */

// Re-export types
export type {
  CECMMember,
  WardMember,
  ConstituencyData,
  ExpenseBreakdown,
  FinancialData,
  AuditData,
  CountyLeadershipData,
} from './county-leadership-types';

// Re-export combined data
export { countyLeadershipData } from './regions';

import type { CECMMember, ConstituencyData, CountyLeadershipData } from './county-leadership-types';
import { countyLeadershipData } from './regions';

/** Get leadership data for a specific county by county code */
export function getLeadershipByCounty(code: string): CountyLeadershipData | undefined {
  return countyLeadershipData.find(c => c.countyCode === code);
}

/** Get all leadership data for all 47 counties */
export function getAllLeadership(): CountyLeadershipData[] {
  return countyLeadershipData;
}

/** Get all counties in a specific region */
export function getLeadershipByRegion(region: string): CountyLeadershipData[] {
  return countyLeadershipData.filter(c => c.region === region);
}

/** Get a county's CECMs by portfolio name */
export function getCECMByPortfolio(countyCode: string, portfolio: string): CECMMember | undefined {
  const county = getLeadershipByCounty(countyCode);
  if (!county) return undefined;
  return county.cecms.find(c => c.portfolio.toLowerCase().includes(portfolio.toLowerCase()));
}

/** Get all constituencies for a county */
export function getConstituencies(countyCode: string): ConstituencyData[] {
  const county = getLeadershipByCounty(countyCode);
  return county?.constituencies ?? [];
}

/** Get total wards across all constituencies for a county */
export function getTotalWards(countyCode: string): number {
  const constituencies = getConstituencies(countyCode);
  return constituencies.reduce((sum, c) => sum + c.wards.length, 0);
}

/** Get counties with highest development absorption rate */
export function getHighAbsorptionCounties(): CountyLeadershipData[] {
  return [...countyLeadershipData].sort(
    (a, b) => b.financial.devAbsorptionRate - a.financial.devAbsorptionRate
  );
}

/** Get counties with highest pending bills */
export function getHighPendingBillsCounties(): CountyLeadershipData[] {
  return [...countyLeadershipData].sort(
    (a, b) => b.financial.pendingBills - a.financial.pendingBills
  );
}
