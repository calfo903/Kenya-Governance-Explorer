/**
 * Kenya Government Representatives Data Schema
 * 2022-2027 Term — Constitution of Kenya 2010 / Devolved Government
 *
 * Every field maps to verifiable public sources.
 * When data is unavailable, the `dataAvailability` flag MUST be set to false
 * with a citation explaining the gap.
 */

// ─── Enums & Constants ────────────────────────────────────────────
export const COALITIONS = {
  KENYA_KWANZA: 'Kenya Kwanza Alliance',
  AZIMIO: 'Azimio la Umoja One Kenya Coalition',
  INDEPENDENT: 'Independent',
} as const;

export const AUDIT_OPINIONS = {
  UNMODIFIED: 'Unmodified',
  QUALIFIED: 'Qualified',
  ADVERSE: 'Adverse',
  DISCLAIMER: 'Disclaimer',
} as const;

export const REGIONS = [
  'Coast',
  'North Eastern',
  'Eastern',
  'Central',
  'Rift Valley',
  'Western',
  'Nyanza',
  'Nairobi',
] as const;

export type Coalition = (typeof COALITIONS)[keyof typeof COALITIONS];
export type AuditOpinion = (typeof AUDIT_OPINIONS)[keyof typeof AUDIT_OPINIONS];
export type Region = (typeof REGIONS)[number];

// ─── Source Citation ───────────────────────────────────────────────
export interface SourceCitation {
  source: string;
  reportTitle: string;
  financialYear: string;
  url?: string;
  section?: string;
  accessedDate: string;
}

// ─── Scorecard Metrics ─────────────────────────────────────────────
export interface ScorecardMetrics {
  overallAccountabilityScore: number | null;
  transparencyAssetDeclaration: number | null;
  projectDeliveryAbsorptionRate: number | null;
  manifestoPromiseFulfillment: number | null;
  legislativeOversightPerformance: number | null;
  ethicsIntegrity: number | null;
  publicSentimentCitizenAwareness: number | null;
}

export interface Scorecard {
  metrics: ScorecardMetrics;
  sources: Partial<Record<keyof ScorecardMetrics, SourceCitation>>;
  lastUpdated: string;
  dataGapsNote?: string;
}

// ─── Core Person Record ───────────────────────────────────────────
export interface Representative {
  id: string;
  fullName: string;
  officialTitle: string;
  politicalParty: string;
  coalition?: Coalition;
  termStart: string;
  termEnd: string;
  jurisdiction: string;
  level: 'national' | 'county' | 'constituency' | 'ward';
  biography: string;
  contacts?: {
    email?: string;
    phone?: string;
    xHandle?: string;
    website?: string;
  };
  scorecard?: Scorecard;
  promiseVsDelivery?: string;
}

// ─── Constituency, Ward, Executive, Assembly ────────────────────────
export interface Ward {
  id: string;
  name: string;
  constituencyId: string;
  mca?: Representative;
}

export interface Constituency {
  id: string;
  name: string;
  countyCode: string;
  mp?: Representative;
  wards: Ward[];
}

export interface CountyExecutiveMember {
  id: string;
  fullName: string;
  portfolio: string;
  contacts?: Representative['contacts'];
  scorecard?: Scorecard;
}

export interface CountyAssembly {
  speaker?: Representative;
  wards: Ward[];
  auditOpinion?: AuditOpinion;
  auditSource?: SourceCitation;
}

// ─── County (full record) ─────────────────────────────────────────
export interface County {
  code: string;
  name: string;
  region: Region;
  capital: string;
  population: number;
  areaSqKm: number;
  constituenciesCount: number;
  wardsCount: number;
  governor?: Representative;
  deputyGovernor?: Representative;
  senator?: Representative;
  womanRep?: Representative;
  constituencies: Constituency[];
  countyAssembly?: CountyAssembly;
  countyExecutive?: CountyExecutiveMember[];
  executiveAuditOpinion?: AuditOpinion;
  executiveAuditSource?: SourceCitation;
  developmentAbsorptionRate?: number;
  developmentAbsorptionSource?: SourceCitation;
  dataAvailability: 'full' | 'partial' | 'placeholder';
  dataAvailabilityNote?: string;
}

// ─── National Summaries ──────────────────────────────────────────
export interface NationalAuditSummary {
  financialYear: string;
  countyExecutive: { unmodified: number; qualified: number; adverse: number; disclaimer: number };
  countyAssembly: { unmodified: number; qualified: number; adverse: number; disclaimer: number };
  source: SourceCitation;
}

export interface NationalBudgetSummary {
  financialYear: string;
  period: string;
  avgDevelopmentAbsorption: number;
  avgRecurrentAbsorption: number;
  topPerformers: { county: string; rate: number }[];
  bottomPerformers: { county: string; rate: number }[];
  totalUnspentAmount?: string;
  source: SourceCitation;
}

export interface NationalSummary {
  auditSummaries: NationalAuditSummary[];
  budgetSummaries: NationalBudgetSummary[];
  lastUpdated: string;
}

// ─── Filter / Comparison ──────────────────────────────────────────
export interface ComparisonItem {
  representative: Representative;
  countyName: string;
}

export interface FilterState {
  region?: Region;
  county?: string;
  party?: string;
  coalition?: Coalition;
  level?: Representative['level'];
  scoreRange?: [number, number];
  auditOpinion?: AuditOpinion;
  keyword?: string;
}

// ─── Color Utilities ──────────────────────────────────────────────
export function getScoreColor(score: number | null | undefined): string {
  if (score === null || score === undefined) return 'bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400';
  if (score >= 80) return 'bg-green-100 text-green-800 border-green-300';
  if (score >= 50) return 'bg-yellow-100 text-yellow-800 border-yellow-300';
  return 'bg-red-100 text-red-800 border-red-300';
}

export function getScoreLabel(score: number | null | undefined): string {
  if (score === null || score === undefined) return 'N/A';
  return score.toString();
}

export function getAuditColor(opinion: AuditOpinion | undefined): string {
  switch (opinion) {
    case AUDIT_OPINIONS.UNMODIFIED: return 'bg-green-100 text-green-800 border-green-300';
    case AUDIT_OPINIONS.QUALIFIED: return 'bg-yellow-100 text-yellow-800 border-yellow-300';
    case AUDIT_OPINIONS.ADVERSE: return 'bg-orange-100 text-orange-800 border-orange-300';
    case AUDIT_OPINIONS.DISCLAIMER: return 'bg-red-100 text-red-800 border-red-300';
    default: return 'bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400 border-gray-300 dark:border-gray-600';
  }
}

// ─── Audit Timeline Types ─────────────────────────────────────────
export interface AuditTimelineEvent {
  id: string;
  date: string;
  title: string;
  description: string;
  type: 'milestone' | 'audit' | 'budget' | 'finding' | 'action' | 'lifecycle_start' | 'lifecycle_end';
  severity?: 'info' | 'warning' | 'critical' | 'success';
  source?: SourceCitation;
  verificationStatus: 'pending' | 'verified';
  projectRef?: string;
}

export interface ProjectRecord {
  id: string;
  name: string;
  countyCode: string;
  category: string;
  status: 'planning' | 'active' | 'stalled' | 'completed' | 'suspended';
  budgetAllocated: number;
  budgetSpent: number;
  startDate: string;
  endDate?: string;
  location: { lat: number; lng: number; name: string };
  implementingAgency: string;
  auditOpinion?: AuditOpinion;
  timeline: AuditTimelineEvent[];
  riskScore?: number;
  riskFactors?: string[];
  citizenPhotos?: number;
}

// ─── Weather Widget Types ─────────────────────────────────────────
export interface WeatherData {
  temperature: number;
  condition: string;
  humidity: number;
  windSpeed: number;
  location: string;
  icon: string;
  fetchedAt: string;
}

// ─── Citizen Auditor Stats ────────────────────────────────────────
export interface CitizenAuditorStats {
  userId: string;
  photosVerified: number;
  rank: number;
  totalParticipants: number;
  badges: string[];
  recentActivity: { date: string; action: string; county: string }[];
}

// ─── AI News Insights ─────────────────────────────────────────────
export interface NewsInsight {
  id: string;
  headline: string;
  source: string;
  url: string;
  publishedAt: string;
  summary: string;
  relevanceScore: number;
}

// ─── Risk Forecasting ─────────────────────────────────────────────
export interface RiskForecast {
  projectId: string;
  stallingProbability: number;
  factors: { name: string; weight: number; status: 'normal' | 'concerning' | 'critical' }[];
  predictedCompletionDate?: string;
  budgetVelocity: number;
  milestoneCompletionRate: number;
  recommendation: string;
}

// ─── Mzalendo Member Types ────────────────────────────────────────
export interface MzalendoMember {
  id: string;
  name: string;
  position: string;
  county: string;
  gender: 'male' | 'female';
  age?: number;
  party: string;
  coalition?: Coalition;
  socialMedia?: { x?: string; facebook?: string; instagram?: string; website?: string };
  voteRecord?: {
    totalVotes: number;
    attendanceRate: number;
    recentBills: { billTitle: string; vote: 'aye' | 'nay' | 'absent'; date: string }[];
  };
  profileUrl?: string;
}
