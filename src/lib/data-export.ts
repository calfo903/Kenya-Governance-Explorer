/**
 * Data Export Utility — CSV Generation & Download
 *
 * Provides reusable functions for exporting Kenya county governance data
 * to CSV format with proper RFC 4180 compliant escaping.
 */

import { getCountyBudget } from '@/data/county-budget-data';
import { getCountyAuditRecords } from '@/data/county-audit-data';
import { all47Governors } from '@/data/governors';
import { getAllLeadership } from '@/data/county-leadership';

// ─── CSV Column Definitions ─────────────────────────────────────────

const COUNTY_EXPORT_COLUMNS = [
  'County Code',
  'County Name',
  'Governor',
  'Party',
  'Coalition',
  'Audit Opinion (FY 2024/25)',
  'Dev Budget Absorption (%)',
  'Total Budget (B KSh)',
  'Own Source Revenue (M KSh)',
  'Pending Bills (M KSh)',
  'Development Budget Share (%)',
  'Constituencies',
] as const;

// ─── Pure CSV Generation ────────────────────────────────────────────

/**
 * Escapes a single CSV field per RFC 4180.
 * - Wraps in double-quotes if the field contains commas, double-quotes, or newlines.
 * - Doubles any existing double-quotes within the field.
 */
function escapeCSVField(value: unknown): string {
  if (value === null || value === undefined) return '';
  const str = String(value);
  if (str.includes(',') || str.includes('"') || str.includes('\n') || str.includes('\r')) {
    return '"' + str.replace(/"/g, '""') + '"';
  }
  return str;
}

/**
 * Pure function that converts an array of objects to a CSV string.
 *
 * @param data  - Array of row objects
 * @param columns - Ordered list of column headers
 * @returns RFC 4180 compliant CSV string with BOM for Excel compatibility
 */
export function generateCSVContent(
  data: Record<string, unknown>[],
  columns: string[],
): string {
  const header = columns.map(escapeCSVField).join(',');

  const rows = data.map((row) => {
    return columns
      .map((col) => {
        const val = row[col] ?? row[normalizeKey(col)];
        return escapeCSVField(val);
      })
      .join(',');
  });

  // Prepend BOM for Excel UTF-8 compatibility
  return '\uFEFF' + header + '\n' + rows.join('\n');
}

/**
 * Normalizes a human-readable column header to a likely camelCase object key.
 */
function normalizeKey(column: string): string {
  return column
    .replace(/\([^)]*\)/g, '')
    .split(/\s+/)
    .filter(Boolean)
    .map((word, i) =>
      i === 0
        ? word.toLowerCase()
        : word.charAt(0).toUpperCase() + word.slice(1).toLowerCase(),
    )
    .join('');
}

// ─── Browser Download Trigger ───────────────────────────────────────

/**
 * Creates a Blob, generates an object URL, clicks an invisible anchor,
 * then revokes the URL.
 */
function triggerDownload(csvContent: string, filename: string): void {
  if (typeof window === 'undefined') return;

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.display = 'none';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

// ─── Generic Export ─────────────────────────────────────────────────

/**
 * Exports an array of objects to CSV and triggers a browser download.
 *
 * @param data    - Array of objects to export
 * @param filename - Download filename (should end in .csv)
 * @param columns  - Optional explicit column list; auto-detected from first row if omitted
 */
export function exportToCSV(
  data: Record<string, unknown>[],
  filename: string,
  columns?: string[],
): void {
  const resolvedColumns = columns ?? (data.length > 0 ? Object.keys(data[0]) : []);
  const csv = generateCSVContent(data, resolvedColumns);
  triggerDownload(csv, filename);
}

// ─── County-Specific Export Helpers ─────────────────────────────────

/**
 * Builds a flat row object for a single county, merging data from
 * governors, budget, audit, and leadership sources.
 */
function buildCountyRow(governor: (typeof all47Governors)[number]): Record<string, unknown> {
  const code = governor.code;

  // Budget data (most recent full-year record)
  const budget = getCountyBudget(code, 'FY 2024/25');

  // Audit data (most recent year)
  const auditRecords = getCountyAuditRecords(code);
  const latestAudit = auditRecords
    .sort((a, b) => b.financialYear.localeCompare(a.financialYear))[0];

  // Development budget share as percentage of total
  const devBudgetShare =
    budget && budget.totalBudget > 0
      ? Number(((budget.developmentBudget / budget.totalBudget) * 100).toFixed(1))
      : 0;

  return {
    'County Code': code,
    'County Name': governor.county,
    Governor: governor.name,
    Party: governor.party,
    Coalition: governor.coalition,
    'Audit Opinion (FY 2024/25)': latestAudit?.executiveOpinion ?? 'N/A',
    'Dev Budget Absorption (%)': budget?.devAbsorptionRate ?? 0,
    'Total Budget (B KSh)': budget?.totalBudget ?? 0,
    'Own Source Revenue (M KSh)': budget?.ownSourceRevenue ?? 0,
    'Pending Bills (M KSh)': budget?.pendingBills ?? 0,
    'Development Budget Share (%)': devBudgetShare,
    Constituencies: governor.constituenciesCount,
  };
}

/**
 * Exports all 47 counties' comprehensive governance data to CSV.
 */
export function exportCountiesToCSV(): void {
  const rows = all47Governors.map(buildCountyRow);
  const csv = generateCSVContent(rows, [...COUNTY_EXPORT_COLUMNS]);
  triggerDownload(csv, 'kenya-47-counties-governance-data.csv');
}

/**
 * Exports comparison data for a selected set of counties.
 *
 * @param countyCodes - Array of 3-character county codes to include
 */
export function exportComparisonToCSV(countyCodes: string[]): void {
  const selected = all47Governors.filter((g) => countyCodes.includes(g.code));
  const rows = selected.map(buildCountyRow);
  const csv = generateCSVContent(rows, [...COUNTY_EXPORT_COLUMNS]);
  triggerDownload(csv, 'kenya-county-comparison.csv');
}