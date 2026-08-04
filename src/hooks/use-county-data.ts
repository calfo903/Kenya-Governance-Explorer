/**
 * React Query hooks for Kenya Governance Explorer
 * 
 * All hooks fetch from /api/db/* routes which read from Prisma/SQLite.
 * These hooks are available for future wiring into components.
 */

import { useQuery, type UseQueryOptions } from '@tanstack/react-query';

// ─── Response Types ──────────────────────────────────────────────

export interface DbCounty {
  id: string;
  name: string;
  code: string;
  region: string;
  capital: string;
  population: number;
  areaSqKm: number;
  constituencies: number;
  wards: number;
  createdAt: string;
  updatedAt: string;
  governor: DbGovernor | null;
}

export interface DbGovernor {
  id: string;
  fullName: string;
  party: string;
  coalition: string | null;
  termStart: string;
  termEnd: string;
  countyCode: string;
  createdAt: string;
  updatedAt: string;
}

export interface DbCECM {
  id: string;
  leadershipId: string;
  portfolio: string;
  fullName: string;
  qualification: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface DbMCA {
  id: string;
  leadershipId: string;
  constituency: string;
  ward: string;
  fullName: string;
  party: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface DbLeadership {
  id: string;
  countyCode: string;
  deputyGovernor: string | null;
  senator: string | null;
  womanRep: string | null;
  assemblySpeaker: string | null;
  createdAt: string;
  updatedAt: string;
  cecms: DbCECM[];
  mcas: DbMCA[];
}

export interface DbAuditRecord {
  id: string;
  countyCode: string;
  financialYear: string;
  executiveOpinion: string | null;
  assemblyOpinion: string | null;
  keyFindings: string[];
  createdAt: string;
  updatedAt: string;
}

export interface DbBudgetRecord {
  id: string;
  countyCode: string;
  financialYear: string;
  totalBudget: number;
  developmentBudget: number;
  recurrentBudget: number;
  devAbsorptionRate: number;
  recurrentAbsorptionRate: number;
  ownSourceRevenue: number;
  pendingBills: number;
  createdAt: string;
  updatedAt: string;
}

export interface DbCountyDetail extends DbCounty {
  governor: DbGovernor | null;
  leadership: DbLeadership | null;
  auditRecords: DbAuditRecord[];
  budgetRecords: DbBudgetRecord[];
}

export interface DbNationalSummary {
  totalCounties: number;
  coalitionDistribution: Record<string, number>;
  auditSummaries: {
    financialYear: string;
    countyExecutive: Record<string, number>;
    countyAssembly: Record<string, number>;
  }[];
  budgetSummaries: {
    financialYear: string;
    countyCount: number;
    avgDevAbsorption: number;
    avgRecurrentAbsorption: number;
    avgTotalBudget: number;
    totalOwnSourceRevenue: number;
    totalPendingBills: number;
    topPerformers: { county: string; rate: number }[];
    bottomPerformers: { county: string; rate: number }[];
  }[];
  lastUpdated: string;
}

interface ApiResponse<T> {
  data: T;
  meta: { count?: number; source: string };
}

// ─── Query Keys ──────────────────────────────────────────────────

export const dbKeys = {
  counties: (filters?: { code?: string; region?: string; coalition?: string }) =>
    ['db', 'counties', filters] as const,
  countyDetail: (code: string) =>
    ['db', 'county', code] as const,
  audits: (filters?: { county?: string; year?: string }) =>
    ['db', 'audits', filters] as const,
  budget: (filters?: { county?: string; year?: string }) =>
    ['db', 'budget', filters] as const,
  summary: () =>
    ['db', 'summary'] as const,
};

// ─── Default Query Options ───────────────────────────────────────

const defaultOptions = {
  staleTime: 5 * 60 * 1000, // 5 minutes
  gcTime: 30 * 60 * 1000, // 30 minutes
};

// ─── Hooks ───────────────────────────────────────────────────────

/** Fetch all counties with their governors */
export function useCounties(
  filters?: { code?: string; region?: string; coalition?: string },
  options?: Partial<UseQueryOptions<ApiResponse<DbCounty[]>>>,
) {
  const params = new URLSearchParams();
  if (filters?.code) params.set('code', filters.code);
  if (filters?.region) params.set('region', filters.region);
  if (filters?.coalition) params.set('coalition', filters.coalition);

  return useQuery({
    queryKey: dbKeys.counties(filters),
    queryFn: async () => {
      const search = params.toString();
      const res = await fetch(`/api/db/counties${search ? `?${search}` : ''}`);
      if (!res.ok) throw new Error(`Failed to fetch counties: ${res.status}`);
      return res.json() as Promise<ApiResponse<DbCounty[]>>;
    },
    ...defaultOptions,
    ...options,
  });
}

/** Fetch full county detail including leadership, audits, and budgets */
export function useCountyDetail(
  code: string,
  options?: Partial<UseQueryOptions<ApiResponse<DbCountyDetail>>>,
) {
  return useQuery({
    queryKey: dbKeys.countyDetail(code),
    queryFn: async () => {
      const res = await fetch(`/api/db/counties/${code}`);
      if (!res.ok) throw new Error(`Failed to fetch county ${code}: ${res.status}`);
      return res.json() as Promise<ApiResponse<DbCountyDetail>>;
    },
    enabled: !!code,
    ...defaultOptions,
    ...options,
  });
}

/** Fetch audit records for a specific county and/or year */
export function useCountyAudit(
  filters?: { county?: string; year?: string },
  options?: Partial<UseQueryOptions<ApiResponse<DbAuditRecord[]>>>,
) {
  const params = new URLSearchParams();
  if (filters?.county) params.set('county', filters.county);
  if (filters?.year) params.set('year', filters.year);

  return useQuery({
    queryKey: dbKeys.audits(filters),
    queryFn: async () => {
      const search = params.toString();
      const res = await fetch(`/api/db/audits${search ? `?${search}` : ''}`);
      if (!res.ok) throw new Error(`Failed to fetch audits: ${res.status}`);
      return res.json() as Promise<ApiResponse<DbAuditRecord[]>>;
    },
    ...defaultOptions,
    ...options,
  });
}

/** Fetch budget records for a specific county and/or year */
export function useCountyBudget(
  filters?: { county?: string; year?: string },
  options?: Partial<UseQueryOptions<ApiResponse<DbBudgetRecord[]>>>,
) {
  const params = new URLSearchParams();
  if (filters?.county) params.set('county', filters.county);
  if (filters?.year) params.set('year', filters.year);

  return useQuery({
    queryKey: dbKeys.budget(filters),
    queryFn: async () => {
      const search = params.toString();
      const res = await fetch(`/api/db/budget${search ? `?${search}` : ''}`);
      if (!res.ok) throw new Error(`Failed to fetch budget: ${res.status}`);
      return res.json() as Promise<ApiResponse<DbBudgetRecord[]>>;
    },
    ...defaultOptions,
    ...options,
  });
}

/** Fetch aggregated national summary statistics */
export function useNationalSummary(
  options?: Partial<UseQueryOptions<ApiResponse<DbNationalSummary>>>,
) {
  return useQuery({
    queryKey: dbKeys.summary(),
    queryFn: async () => {
      const res = await fetch('/api/db/summary');
      if (!res.ok) throw new Error(`Failed to fetch summary: ${res.status}`);
      return res.json() as Promise<ApiResponse<DbNationalSummary>>;
    },
    ...defaultOptions,
    ...options,
  });
}
