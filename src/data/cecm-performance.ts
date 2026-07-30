/**
 * CECM Performance Scoring System
 *
 * Calculates a composite "CECM Performance Score" (0-100) for each of Kenya's 47 counties
 * based on three weighted components:
 *   1. Budget absorption rate (50%) — from county-budget-data.ts
 *   2. Audit opinion quality (30%) — from county-audit-data.ts
 *   3. CECM staffing completeness (20%) — from county leadership data in regions/*.ts
 *
 * This is a derived/analytical score, not raw data. It helps visualize how well
 * county executives are performing across multiple governance dimensions.
 */

import { countyBudgetData } from './county-budget-data';
import { countyAuditData } from './county-audit-data';
import { countyLeadershipData } from './regions';
import { all47Governors } from './governors';
import { AUDIT_OPINIONS } from './types';

// ─── Types ────────────────────────────────────────────────────────────

export interface CECMScore {
  countyCode: string;
  countyName: string;
  region: string;
  overallScore: number;
  budgetAbsorptionScore: number;
  staffingScore: number;
  auditScore: number;
  cecmsFilled: number;
  cecmsExpected: number;
}

// ─── Constants ─────────────────────────────────────────────────────────

const EXPECTED_CECM_COUNT = 10;

/** Audit opinion → numeric score (0-100) */
const AUDIT_SCORE_MAP: Record<string, number> = {
  [AUDIT_OPINIONS.UNMODIFIED]: 100,
  [AUDIT_OPINIONS.QUALIFIED]: 60,
  [AUDIT_OPINIONS.ADVERSE]: 30,
  [AUDIT_OPINIONS.DISCLAIMER]: 10,
};

const WEIGHTS = {
  budgetAbsorption: 0.50,
  audit: 0.30,
  staffing: 0.20,
} as const;

// ─── Scoring Functions ────────────────────────────────────────────────

/**
 * Budget absorption score: directly maps devAbsorptionRate (0-100) to 0-100.
 * Values above 100 are clamped.
 */
function computeBudgetScore(countyCode: string, financialYear: string): number {
  // Prefer Full Year records, then any record for the FY
  const records = countyBudgetData.filter(
    (r) => r.countyCode === countyCode && r.financialYear === financialYear,
  );
  const fullYearRec = records.find((r) => r.period === 'Full Year');
  const rec = fullYearRec ?? records[0];
  if (!rec) return 0;
  return Math.min(100, Math.round(rec.devAbsorptionRate));
}

/**
 * Audit score: maps audit opinion to a numeric score.
 * Uses latest available audit opinion for the given FY.
 */
function computeAuditScore(countyCode: string, financialYear: string): number {
  const records = countyAuditData.filter(
    (r) => r.countyCode === countyCode && r.financialYear === financialYear,
  );
  const rec = records[0];
  if (!rec || !rec.executiveOpinion) return 0;
  return AUDIT_SCORE_MAP[rec.executiveOpinion] ?? 0;
}

/**
 * Staffing score: ratio of CECMs filled vs expected (~10).
 * Score is 100 if filled >= expected, otherwise (filled/expected * 100).
 */
function computeStaffingScore(countyCode: string): { score: number; filled: number; expected: number } {
  const leadership = countyLeadershipData.find((c) => c.countyCode === countyCode);
  const filled = leadership?.cecms?.length ?? 0;
  if (filled >= EXPECTED_CECM_COUNT) {
    return { score: 100, filled, expected: EXPECTED_CECM_COUNT };
  }
  return {
    score: Math.round((filled / EXPECTED_CECM_COUNT) * 100),
    filled,
    expected: EXPECTED_CECM_COUNT,
  };
}

// ─── Main Export ──────────────────────────────────────────────────────

/**
 * Returns a Map<string, CECMScore> keyed by countyCode for all 47 counties.
 * Uses FY 2024/25 by default.
 */
export function getCECMPerformanceScores(financialYear: string = 'FY 2024/25'): Map<string, CECMScore> {
  const result = new Map<string, CECMScore>();

  for (const gov of all47Governors) {
    const budgetScore = computeBudgetScore(gov.code, financialYear);
    const auditScore = computeAuditScore(gov.code, financialYear);
    const { score: staffingScore, filled, expected } = computeStaffingScore(gov.code);

    const overallScore = Math.round(
      budgetScore * WEIGHTS.budgetAbsorption +
      auditScore * WEIGHTS.audit +
      staffingScore * WEIGHTS.staffing,
    );

    result.set(gov.code, {
      countyCode: gov.code,
      countyName: gov.county,
      region: gov.region,
      overallScore,
      budgetAbsorptionScore: budgetScore,
      staffingScore,
      auditScore,
      cecmsFilled: filled,
      cecmsExpected: expected,
    });
  }

  return result;
}

/**
 * Get a single county's CECM performance score.
 */
export function getCountyCECMScore(
  countyCode: string,
  financialYear: string = 'FY 2024/25',
): CECMScore | undefined {
  const scores = getCECMPerformanceScores(financialYear);
  return scores.get(countyCode);
}

/**
 * Get CECM performance score color based on score range.
 */
export function getCECMScoreColor(score: number): string {
  if (score >= 80) return '#047857'; // Dark emerald
  if (score >= 60) return '#059669'; // Emerald
  if (score >= 40) return '#d97706'; // Amber
  if (score >= 20) return '#ea580c'; // Orange
  return '#dc2626'; // Red
}

/**
 * Get CECM performance score badge class for UI.
 */
export function getCECMScoreBadgeClass(score: number): string {
  if (score >= 80) return 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-800 dark:text-emerald-300 border-emerald-300 dark:border-emerald-700';
  if (score >= 60) return 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 border-green-300 dark:border-green-700';
  if (score >= 40) return 'bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-300 border-amber-300 dark:border-amber-700';
  if (score >= 20) return 'bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-300 border-orange-300 dark:border-orange-700';
  return 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300 border-red-300 dark:border-red-700';
}

/**
 * Get CECM performance label.
 */
export function getCECMScoreLabel(score: number): string {
  if (score >= 80) return 'High Performing';
  if (score >= 60) return 'Good';
  if (score >= 40) return 'Average';
  if (score >= 20) return 'Below Average';
  return 'Poor';
}

/**
 * Get CECM bar background color class.
 */
export function getCECMBarColor(score: number): string {
  if (score >= 80) return 'bg-emerald-600';
  if (score >= 60) return 'bg-green-500';
  if (score >= 40) return 'bg-amber-500';
  if (score >= 20) return 'bg-orange-500';
  return 'bg-red-500';
}
