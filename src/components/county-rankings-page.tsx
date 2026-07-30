'use client';

import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer,
  Tooltip as RechartsTooltip, Cell, PieChart, Pie, Legend,
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  ScatterChart, Scatter, ZAxis,
} from 'recharts';
import {
  Trophy, ArrowDown, ArrowUp, Search, Filter, ChevronDown, ChevronUp,
  TrendingUp, MapPin, Shield, Banknote, Users, Crown, BarChart3, PieChartIcon, Radar as RadarIcon,
  CircleDot, Award, Medal, Star, XCircle, AlertTriangle, CheckCircle2,
} from 'lucide-react';
import { countyBudgetData, getCountyBudget } from '@/data/county-budget-data';
import { countyAuditData, getCountyAuditRecords } from '@/data/county-audit-data';
import { all47Governors } from '@/data/governors';
import { REGIONS, AUDIT_OPINIONS, Region } from '@/data/types';
import type { AuditOpinion } from '@/data/types';

// ─── Types ──────────────────────────────────────────────────────

interface CountyScore {
  countyCode: string;
  countyName: string;
  region: Region;
  governor: string;
  party: string;
  coalition: string;
  auditOpinion: AuditOpinion | null;
  auditScore: number;
  devAbsorptionScore: number;
  ownSourceScore: number;
  recurrentAbsorptionScore: number;
  compositeScore: number;
  totalBudget: number;
  ownSourceRevenue: number;
  pendingBills: number;
  rank: number;
}

type SortField = 'composite' | 'audit' | 'devAbsorption' | 'ownSource' | 'recurrent';
type TierKey = 'S' | 'A' | 'B' | 'C' | 'D';

// ─── Scoring Helpers ────────────────────────────────────────────

const FY = 'FY 2024/25';

function auditOpinionToScore(opinion: AuditOpinion | null): number {
  if (!opinion) return 0;
  switch (opinion) {
    case AUDIT_OPINIONS.UNMODIFIED: return 100;
    case AUDIT_OPINIONS.QUALIFIED: return 50;
    case AUDIT_OPINIONS.ADVERSE: return 25;
    case AUDIT_OPINIONS.DISCLAIMER: return 0;
    default: return 0;
  }
}

function ownSourceToScore(ownSourceRevenue: number): number {
  return Math.min(100, ownSourceRevenue / 30);
}

function getTier(score: number): TierKey {
  if (score >= 80) return 'S';
  if (score >= 60) return 'A';
  if (score >= 40) return 'B';
  if (score >= 20) return 'C';
  return 'D';
}

const TIER_CONFIG: Record<TierKey, { label: string; color: string; bg: string; border: string; text: string; desc: string }> = {
  S: { label: 'S Tier', color: 'bg-emerald-100 text-emerald-800 border-emerald-300', bg: 'bg-emerald-50', border: 'border-emerald-200', text: 'text-emerald-700', desc: 'Top Performers (80+)' },
  A: { label: 'A Tier', color: 'bg-blue-100 text-blue-800 border-blue-300', bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-700', desc: 'Good (60-79)' },
  B: { label: 'B Tier', color: 'bg-amber-100 text-amber-800 border-amber-300', bg: 'bg-amber-50', border: 'border-amber-200', text: 'text-amber-700', desc: 'Average (40-59)' },
  C: { label: 'C Tier', color: 'bg-orange-100 text-orange-800 border-orange-300', bg: 'bg-orange-50', border: 'border-orange-200', text: 'text-orange-700', desc: 'Below Average (20-39)' },
  D: { label: 'D Tier', color: 'bg-red-100 text-red-800 border-red-300', bg: 'bg-red-50', border: 'border-red-200', text: 'text-red-700', desc: 'Poor Performers (<20)' },
};

function getAuditBadgeColor(opinion: AuditOpinion | null): string {
  if (!opinion) return 'bg-gray-100 text-gray-500 border-gray-300';
  switch (opinion) {
    case AUDIT_OPINIONS.UNMODIFIED: return 'bg-emerald-100 text-emerald-800 border-emerald-300';
    case AUDIT_OPINIONS.QUALIFIED: return 'bg-amber-100 text-amber-800 border-amber-300';
    case AUDIT_OPINIONS.ADVERSE: return 'bg-orange-100 text-orange-800 border-orange-300';
    case AUDIT_OPINIONS.DISCLAIMER: return 'bg-red-100 text-red-800 border-red-300';
    default: return 'bg-gray-100 text-gray-500 border-gray-300';
  }
}

function getScoreBadgeColor(score: number): string {
  if (score >= 80) return 'bg-emerald-100 text-emerald-800';
  if (score >= 60) return 'bg-blue-100 text-blue-800';
  if (score >= 40) return 'bg-amber-100 text-amber-800';
  if (score >= 20) return 'bg-orange-100 text-orange-800';
  return 'bg-red-100 text-red-800';
}

// ─── Custom Recharts Tooltip ────────────────────────────────────

function CustomChartTooltip({ active, payload, label }: { active?: boolean; payload?: Array<{ value: number; name: string; color?: string }>; label?: string }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-stone-200 bg-white px-3 py-2 shadow-lg">
      <p className="text-[11px] font-semibold text-stone-700">{label}</p>
      {payload.map((entry, i) => (
        <p key={i} className="text-[11px] text-stone-600">
          <span style={{ color: entry.color }}>●</span>{' '}
          {entry.name}: <span className="font-semibold">{typeof entry.value === 'number' ? entry.value.toFixed(1) : entry.value}</span>
        </p>
      ))}
    </div>
  );
}

// ─── Main Component ─────────────────────────────────────────────

export default function CountyRankingsPage() {
  const [regionFilter, setRegionFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<SortField>('composite');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedCounty, setExpandedCounty] = useState<string | null>(null);

  // ── Compute all 47 county scores ──
  const allScores = useMemo<CountyScore[]>(() => {
    const fyBudgets = countyBudgetData.filter(r => r.financialYear === FY && r.period === 'Full Year');
    const fyAudits = countyAuditData.filter(r => r.financialYear === FY);

    return all47Governors.map(gov => {
      const budget = fyBudgets.find(b => b.countyCode === gov.code);
      const audit = fyAudits.find(a => a.countyCode === gov.code);

      const auditScore = auditOpinionToScore(audit?.executiveOpinion ?? null);
      const devAbsorptionScore = budget?.devAbsorptionRate ?? 0;
      const ownSourceScore = ownSourceToScore(budget?.ownSourceRevenue ?? 0);
      const recurrentAbsorptionScore = budget?.recurrentAbsorptionRate ?? 0;

      const compositeScore =
        0.30 * auditScore +
        0.30 * devAbsorptionScore +
        0.20 * ownSourceScore +
        0.20 * recurrentAbsorptionScore;

      return {
        countyCode: gov.code,
        countyName: gov.county,
        region: gov.region,
        governor: gov.name,
        party: gov.party,
        coalition: gov.coalition,
        auditOpinion: audit?.executiveOpinion ?? null,
        auditScore,
        devAbsorptionScore,
        ownSourceScore,
        recurrentAbsorptionScore,
        compositeScore: Math.round(compositeScore * 10) / 10,
        totalBudget: budget?.totalBudget ?? 0,
        ownSourceRevenue: budget?.ownSourceRevenue ?? 0,
        pendingBills: budget?.pendingBills ?? 0,
        rank: 0,
      };
    }).sort((a, b) => b.compositeScore - a.compositeScore)
      .map((s, i) => ({ ...s, rank: i + 1 }));
  }, []);

  // ── Filter & sort ──
  const filteredScores = useMemo(() => {
    let data = [...allScores];

    if (regionFilter !== 'all') {
      data = data.filter(d => d.region === regionFilter);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      data = data.filter(d =>
        d.countyName.toLowerCase().includes(q) ||
        d.governor.toLowerCase().includes(q) ||
        d.party.toLowerCase().includes(q)
      );
    }

    const sortMap: Record<SortField, (s: CountyScore) => number> = {
      composite: s => s.compositeScore,
      audit: s => s.auditScore,
      devAbsorption: s => s.devAbsorptionScore,
      ownSource: s => s.ownSourceScore,
      recurrent: s => s.recurrentAbsorptionScore,
    };
    data.sort((a, b) => sortMap[sortBy](b) - sortMap[sortBy](a));
    data.forEach((s, i) => { s.rank = i + 1; });

    return data;
  }, [allScores, regionFilter, sortBy, searchQuery]);

  // ── Chart data ──
  const top10 = useMemo(() =>
    [...allScores].sort((a, b) => b.compositeScore - a.compositeScore).slice(0, 10)
      .map(s => ({ name: s.countyName, score: s.compositeScore, fill: s.compositeScore >= 60 ? '#059669' : s.compositeScore >= 40 ? '#d97706' : '#dc2626' })),
    [allScores]
  );

  const bottom10 = useMemo(() =>
    [...allScores].sort((a, b) => a.compositeScore - b.compositeScore).slice(0, 10)
      .map(s => ({ name: s.countyName, score: s.compositeScore, fill: s.compositeScore >= 40 ? '#d97706' : '#dc2626' })),
    [allScores]
  );

  const regionRadar = useMemo(() => {
    const regionMap = new Map<string, number[]>();
    allScores.forEach(s => {
      if (!regionMap.has(s.region)) regionMap.set(s.region, []);
      regionMap.get(s.region)!.push(s.compositeScore);
    });
    return REGIONS.map(r => {
      const scores = regionMap.get(r) ?? [];
      const avg = scores.length ? scores.reduce((a, b) => a + b, 0) / scores.length : 0;
      return { region: r, score: Math.round(avg * 10) / 10, fullMark: 100 };
    });
  }, [allScores]);

  const auditPieData = useMemo(() => {
    const counts: Record<string, number> = { Unmodified: 0, Qualified: 0, Adverse: 0, Disclaimer: 0 };
    allScores.forEach(s => {
      const op = s.auditOpinion ?? 'Disclaimer';
      if (op in counts) counts[op]++;
      else counts['Disclaimer']++;
    });
    return [
      { name: 'Unmodified', value: counts.Unmodified, fill: '#059669' },
      { name: 'Qualified', value: counts.Qualified, fill: '#d97706' },
      { name: 'Adverse', value: counts.Adverse, fill: '#ea580c' },
      { name: 'Disclaimer', value: counts.Disclaimer, fill: '#dc2626' },
    ].filter(d => d.value > 0);
  }, [allScores]);

  const scatterData = useMemo(() =>
    allScores.map(s => ({
      name: s.countyName,
      x: s.devAbsorptionScore,
      y: s.ownSourceScore,
      z: s.totalBudget,
      composite: s.compositeScore,
    })),
    [allScores]
  );

  const tierCounts = useMemo(() => {
    const counts: Record<TierKey, number> = { S: 0, A: 0, B: 0, C: 0, D: 0 };
    allScores.forEach(s => { counts[getTier(s.compositeScore)]++; });
    return counts;
  }, [allScores]);

  // ── Render ──
  return (
    <TooltipProvider delayDuration={200}>
    <div className="min-h-screen bg-stone-50/50">
      {/* Header */}
      <div className="border-b border-stone-200 bg-white px-4 py-6 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="flex items-center gap-2 text-xl font-bold text-stone-900 sm:text-2xl">
                <Trophy className="h-6 w-6 text-amber-500" />
                County Governance Rankings
              </h1>
              <p className="mt-1 text-xs text-stone-500 sm:text-sm">
                Composite scoring of all 47 counties — FY 2024/25 | Audit, Budget Absorption & Own-Source Revenue
              </p>
            </div>
            <div className="mt-3 flex flex-wrap gap-2 sm:mt-0">
              {(['S', 'A', 'B', 'C', 'D'] as TierKey[]).map(t => (
                <Badge key={t} variant="outline" className={`${TIER_CONFIG[t].color} text-[10px] font-bold`}>
                  {t}: {tierCounts[t]}
                </Badge>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        {/* Scoring Formula Card */}
        <Card className="mb-6 border-stone-200 bg-white">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Star className="h-4 w-4 text-amber-500" />
              <h3 className="text-sm font-semibold text-stone-800">Composite Scoring Formula</h3>
            </div>
            <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-[11px] text-stone-600 sm:grid-cols-4">
              <div className="flex items-center gap-1.5">
                <Shield className="h-3 w-3 text-emerald-600" />
                <span><strong>30%</strong> Audit Opinion</span>
              </div>
              <div className="flex items-center gap-1.5">
                <TrendingUp className="h-3 w-3 text-blue-600" />
                <span><strong>30%</strong> Dev Absorption</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Banknote className="h-3 w-3 text-amber-600" />
                <span><strong>20%</strong> Own-Source Revenue</span>
              </div>
              <div className="flex items-center gap-1.5">
                <BarChart3 className="h-3 w-3 text-purple-600" />
                <span><strong>20%</strong> Recurrent Absorption</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Controls */}
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative flex-1 sm:max-w-xs">
            <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />
            <input
              type="text"
              placeholder="Search county, governor, party..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="h-9 w-full rounded-md border border-stone-200 bg-white pl-9 pr-3 text-sm text-stone-700 placeholder:text-stone-400 focus:border-stone-400 focus:outline-none focus:ring-1 focus:ring-stone-300"
            />
          </div>
          <div className="flex gap-2">
            <Select value={regionFilter} onValueChange={setRegionFilter}>
              <SelectTrigger className="h-9 w-[150px] text-xs">
                <MapPin className="mr-1.5 h-3.5 w-3.5 text-stone-400" />
                <SelectValue placeholder="All Regions" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Regions</SelectItem>
                {REGIONS.map(r => (
                  <SelectItem key={r} value={r}>{r}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={sortBy} onValueChange={(v) => setSortBy(v as SortField)}>
              <SelectTrigger className="h-9 w-[160px] text-xs">
                <Filter className="mr-1.5 h-3.5 w-3.5 text-stone-400" />
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="composite">Composite Score</SelectItem>
                <SelectItem value="audit">Audit Score</SelectItem>
                <SelectItem value="devAbsorption">Dev Absorption</SelectItem>
                <SelectItem value="ownSource">Own-Source Rev.</SelectItem>
                <SelectItem value="recurrent">Recurrent Abs.</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Main Tabs: Rankings + Charts */}
        <Tabs defaultValue="rankings" className="space-y-6">
          <TabsList className="bg-stone-100">
            <TabsTrigger value="rankings" className="text-xs gap-1.5">
              <Award className="h-3.5 w-3.5" />Tier Rankings
            </TabsTrigger>
            <TabsTrigger value="charts" className="text-xs gap-1.5">
              <PieChartIcon className="h-3.5 w-3.5" />Charts & Analysis
            </TabsTrigger>
          </TabsList>

          {/* ═══════════ TIER RANKINGS TAB ═══════════ */}
          <TabsContent value="rankings" className="space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-xs text-stone-500">
                Showing {filteredScores.length} of 47 counties
                {regionFilter !== 'all' && ` in ${regionFilter}`}
              </p>
            </div>

            <ScrollArea className="h-[calc(100vh-380px)] min-h-[500px] rounded-lg border border-stone-200 bg-white">
              <div className="divide-y divide-stone-100">
                {filteredScores.map((county) => {
                  const tier = getTier(county.compositeScore);
                  const tc = TIER_CONFIG[tier];
                  const isExpanded = expandedCounty === county.countyCode;

                  return (
                    <div
                      key={county.countyCode}
                      className={`transition-colors hover:bg-stone-50/80 ${isExpanded ? tc.bg : ''}`}
                    >
                      {/* Row */}
                      <button
                        onClick={() => setExpandedCounty(isExpanded ? null : county.countyCode)}
                        className="flex w-full items-center gap-2 px-3 py-2.5 text-left sm:gap-3 sm:px-4 sm:py-3"
                      >
                        {/* Rank */}
                        <div className="flex w-8 shrink-0 items-center justify-center">
                          {county.rank <= 3 ? (
                            <Medal className={`h-5 w-5 ${county.rank === 1 ? 'text-amber-500' : county.rank === 2 ? 'text-stone-400' : 'text-amber-700'}`} />
                          ) : (
                            <span className="text-xs font-bold text-stone-400">#{county.rank}</span>
                          )}
                        </div>

                        {/* Tier Badge */}
                        <Badge variant="outline" className={`${tc.color} shrink-0 text-[10px] font-bold px-1.5 py-0`}>{tier}</Badge>

                        {/* County Info */}
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <span className="truncate text-sm font-semibold text-stone-800">{county.countyName}</span>
                            <span className="hidden text-[10px] text-stone-400 sm:inline">{county.countyCode}</span>
                          </div>
                          <div className="mt-0.5 flex items-center gap-2 text-[11px] text-stone-500">
                            <span className="truncate">{county.governor}</span>
                            <span className="hidden sm:inline text-stone-300">•</span>
                            <span className="hidden sm:inline">{county.party}</span>
                          </div>
                        </div>

                        {/* Score badges - desktop */}
                        <div className="hidden items-center gap-2 lg:flex">
                          <Tooltip>
                            <TooltipTrigger>
                              <Badge variant="outline" className={`${getAuditBadgeColor(county.auditOpinion)} text-[10px]`}>{county.auditOpinion ?? 'N/A'}</Badge>
                            </TooltipTrigger>
                            <TooltipContent><p className="text-[11px]">Audit: {county.auditScore}/100</p></TooltipContent>
                          </Tooltip>
                          <Tooltip>
                            <TooltipTrigger>
                              <span className={`inline-flex items-center rounded px-1.5 py-0.5 text-[10px] font-semibold ${getScoreBadgeColor(county.devAbsorptionScore)}`}>{county.devAbsorptionScore}%</span>
                            </TooltipTrigger>
                            <TooltipContent><p className="text-[11px]">Dev Absorption</p></TooltipContent>
                          </Tooltip>
                          <Tooltip>
                            <TooltipTrigger>
                              <span className={`inline-flex items-center rounded px-1.5 py-0.5 text-[10px] font-semibold ${getScoreBadgeColor(county.ownSourceScore)}`}>{county.ownSourceScore.toFixed(1)}</span>
                            </TooltipTrigger>
                            <TooltipContent><p className="text-[11px]">Own-Source Score</p></TooltipContent>
                          </Tooltip>
                          <Tooltip>
                            <TooltipTrigger>
                              <span className={`inline-flex items-center rounded px-1.5 py-0.5 text-[10px] font-semibold ${getScoreBadgeColor(county.recurrentAbsorptionScore)}`}>{county.recurrentAbsorptionScore}%</span>
                            </TooltipTrigger>
                            <TooltipContent><p className="text-[11px]">Recurrent Absorption</p></TooltipContent>
                          </Tooltip>
                        </div>

                        {/* Composite Score */}
                        <div className="flex items-center gap-2 shrink-0">
                          <div className="text-right">
                            <p className={`text-sm font-bold ${tc.text}`}>{county.compositeScore}</p>
                            <p className="text-[10px] text-stone-400">/100</p>
                          </div>
                          {isExpanded ? <ChevronUp className="h-4 w-4 text-stone-400" /> : <ChevronDown className="h-4 w-4 text-stone-400" />}
                        </div>
                      </button>

                      {/* Expanded Details */}
                      {isExpanded && (
                        <div className={`border-t ${tc.border} px-4 pb-4 pt-3 sm:px-6`}>
                          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                            {/* Governor Card */}
                            <div className="rounded-lg border border-stone-200 bg-white p-3">
                              <p className="text-[10px] font-semibold uppercase tracking-wider text-stone-400">Governor</p>
                              <p className="mt-1 text-sm font-semibold text-stone-800">{county.governor}</p>
                              <div className="mt-1.5 flex flex-wrap gap-1">
                                <Badge variant="outline" className="text-[10px]">{county.party}</Badge>
                                <Badge variant="outline" className="text-[10px] text-stone-500">{county.coalition}</Badge>
                              </div>
                            </div>

                            {/* Audit Opinion */}
                            <div className="rounded-lg border border-stone-200 bg-white p-3">
                              <p className="text-[10px] font-semibold uppercase tracking-wider text-stone-400">Audit Opinion (FY 2024/25)</p>
                              <div className="mt-1.5">
                                <Badge variant="outline" className={`${getAuditBadgeColor(county.auditOpinion)} text-xs font-semibold`}>
                                  {county.auditOpinion ?? 'Not Available'}
                                </Badge>
                              </div>
                              <p className="mt-1 text-[11px] text-stone-500">Score: <strong>{county.auditScore}/100</strong></p>
                            </div>

                            {/* Budget */}
                            <div className="rounded-lg border border-stone-200 bg-white p-3">
                              <p className="text-[10px] font-semibold uppercase tracking-wider text-stone-400">Budget FY 2024/25</p>
                              <p className="mt-1 text-sm font-semibold text-stone-800">KSh {county.totalBudget.toFixed(1)}B</p>
                              <p className="mt-1 text-[11px] text-stone-500">Own-Source: KSh {(county.ownSourceRevenue / 1000).toFixed(1)}B</p>
                              <p className="text-[11px] text-stone-500">Pending Bills: KSh {(county.pendingBills / 1000).toFixed(1)}B</p>
                            </div>

                            {/* All Scores Breakdown */}
                            <div className="rounded-lg border border-stone-200 bg-white p-3">
                              <p className="text-[10px] font-semibold uppercase tracking-wider text-stone-400">Score Breakdown</p>
                              <div className="mt-2 space-y-2">
                                <div>
                                  <div className="flex justify-between text-[11px]">
                                    <span className="text-stone-600">Audit (30%)</span>
                                    <span className="font-semibold text-stone-800">{county.auditScore}</span>
                                  </div>
                                  <Progress value={county.auditScore} className="mt-0.5 h-1.5" />
                                </div>
                                <div>
                                  <div className="flex justify-between text-[11px]">
                                    <span className="text-stone-600">Dev Absorption (30%)</span>
                                    <span className="font-semibold text-stone-800">{county.devAbsorptionScore}%</span>
                                  </div>
                                  <Progress value={county.devAbsorptionScore} className="mt-0.5 h-1.5" />
                                </div>
                                <div>
                                  <div className="flex justify-between text-[11px]">
                                    <span className="text-stone-600">Own-Source (20%)</span>
                                    <span className="font-semibold text-stone-800">{county.ownSourceScore.toFixed(1)}</span>
                                  </div>
                                  <Progress value={Math.min(county.ownSourceScore, 100)} className="mt-0.5 h-1.5" />
                                </div>
                                <div>
                                  <div className="flex justify-between text-[11px]">
                                    <span className="text-stone-600">Recurrent Abs. (20%)</span>
                                    <span className="font-semibold text-stone-800">{county.recurrentAbsorptionScore}%</span>
                                  </div>
                                  <Progress value={county.recurrentAbsorptionScore} className="mt-0.5 h-1.5" />
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </ScrollArea>
          </TabsContent>

          {/* ═══════════ CHARTS TAB ═══════════ */}
          <TabsContent value="charts" className="space-y-6">
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              {/* Top 10 Bar Chart */}
              <Card className="border-stone-200">
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center gap-2 text-sm font-semibold text-stone-800">
                    <Trophy className="h-4 w-4 text-amber-500" />
                    Top 10 Counties — Composite Score
                  </CardTitle>
                  <CardDescription className="text-[11px]">FY 2024/25 composite governance score</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={320}>
                    <BarChart data={top10} layout="vertical" margin={{ left: 10, right: 20, top: 5, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e7e5e4" horizontal={false} />
                      <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 10, fill: '#78716c' }} />
                      <YAxis type="category" dataKey="name" width={90} tick={{ fontSize: 10, fill: '#57534e' }} />
                      <RechartsTooltip content={<CustomChartTooltip />} />
                      <Bar dataKey="score" name="Composite Score" radius={[0, 4, 4, 0]} barSize={18}>
                        {top10.map((entry, index) => (
                          <Cell key={index} fill={entry.fill} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Bottom 10 Bar Chart */}
              <Card className="border-stone-200">
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center gap-2 text-sm font-semibold text-stone-800">
                    <AlertTriangle className="h-4 w-4 text-red-500" />
                    Bottom 10 Counties — Composite Score
                  </CardTitle>
                  <CardDescription className="text-[11px]">Counties requiring attention</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={320}>
                    <BarChart data={bottom10} layout="vertical" margin={{ left: 10, right: 20, top: 5, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e7e5e4" horizontal={false} />
                      <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 10, fill: '#78716c' }} />
                      <YAxis type="category" dataKey="name" width={90} tick={{ fontSize: 10, fill: '#57534e' }} />
                      <RechartsTooltip content={<CustomChartTooltip />} />
                      <Bar dataKey="score" name="Composite Score" radius={[0, 4, 4, 0]} barSize={18}>
                        {bottom10.map((entry, index) => (
                          <Cell key={index} fill={entry.fill} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Radar Chart - Region Comparison */}
              <Card className="border-stone-200">
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center gap-2 text-sm font-semibold text-stone-800">
                    <RadarIcon className="h-4 w-4 text-blue-500" />
                    Regional Comparison — Avg Composite Score
                  </CardTitle>
                  <CardDescription className="text-[11px]">Average composite score per region</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={340}>
                    <RadarChart data={regionRadar} cx="50%" cy="50%" outerRadius="70%">
                      <PolarGrid stroke="#d6d3d1" />
                      <PolarAngleAxis dataKey="region" tick={{ fontSize: 10, fill: '#57534e' }} />
                      <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fontSize: 9, fill: '#a8a29e' }} />
                      <Radar
                        name="Avg Score"
                        dataKey="score"
                        stroke="#059669"
                        fill="#059669"
                        fillOpacity={0.2}
                        strokeWidth={2}
                      />
                      <RechartsTooltip content={<CustomChartTooltip />} />
                    </RadarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Pie Chart - Audit Opinion Distribution */}
              <Card className="border-stone-200">
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center gap-2 text-sm font-semibold text-stone-800">
                    <Shield className="h-4 w-4 text-emerald-500" />
                    Audit Opinion Distribution
                  </CardTitle>
                  <CardDescription className="text-[11px]">FY 2024/25 executive audit opinions for 47 counties</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={340}>
                    <PieChart>
                      <Pie
                        data={auditPieData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={110}
                        paddingAngle={3}
                        dataKey="value"
                        label={({ name, value, percent }) => `${name}: ${value} (${(percent * 100).toFixed(0)}%)`}
                        labelLine={{ stroke: '#a8a29e' }}
                      >
                        {auditPieData.map((entry, index) => (
                          <Cell key={index} fill={entry.fill} />
                        ))}
                      </Pie>
                      <RechartsTooltip content={<CustomChartTooltip />} />
                      <Legend
                        verticalAlign="bottom"
                        iconType="circle"
                        formatter={(value: string) => <span className="text-[11px] text-stone-600">{value}</span>}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Scatter Plot - Dev Absorption vs Own-Source Revenue */}
              <Card className="border-stone-200 lg:col-span-2">
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center gap-2 text-sm font-semibold text-stone-800">
                    <CircleDot className="h-4 w-4 text-purple-500" />
                    Budget Absorption vs Own-Source Revenue
                  </CardTitle>
                  <CardDescription className="text-[11px]">
                    Bubble size = total budget (KSh B). X-axis: Dev absorption rate (%). Y-axis: Own-source revenue score.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={380}>
                    <ScatterChart margin={{ left: 10, right: 30, top: 10, bottom: 10 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e7e5e4" />
                      <XAxis
                        type="number"
                        dataKey="x"
                        name="Dev Absorption"
                        unit="%"
                        domain={[0, 100]}
                        tick={{ fontSize: 10, fill: '#78716c' }}
                        label={{ value: 'Dev Absorption Rate (%)', position: 'insideBottom', offset: -5, fontSize: 11, fill: '#78716c' }}
                      />
                      <YAxis
                        type="number"
                        dataKey="y"
                        name="Own-Source Score"
                        domain={[0, 100]}
                        tick={{ fontSize: 10, fill: '#78716c' }}
                        label={{ value: 'Own-Source Revenue Score', angle: -90, position: 'insideLeft', offset: 10, fontSize: 11, fill: '#78716c' }}
                      />
                      <ZAxis type="number" dataKey="z" range={[40, 600]} name="Total Budget (B)" />
                      <RechartsTooltip
                        content={({ active, payload }) => {
                          if (!active || !payload?.length) return null;
                          const d = payload[0].payload;
                          return (
                            <div className="rounded-lg border border-stone-200 bg-white px-3 py-2 shadow-lg">
                              <p className="text-[11px] font-semibold text-stone-700">{d.name}</p>
                              <p className="text-[11px] text-stone-600">Dev Absorption: <strong>{d.x}%</strong></p>
                              <p className="text-[11px] text-stone-600">Own-Source Score: <strong>{d.y.toFixed(1)}</strong></p>
                              <p className="text-[11px] text-stone-600">Total Budget: <strong>KSh {d.z.toFixed(1)}B</strong></p>
                              <p className="text-[11px] text-stone-600">Composite: <strong>{d.composite}</strong></p>
                            </div>
                          );
                        }}
                      />
                      <Scatter data={scatterData} fill="#059669" fillOpacity={0.7} stroke="#047857" strokeWidth={1}>
                        {scatterData.map((entry, index) => {
                          const tier = getTier(entry.composite);
                          const colorMap: Record<TierKey, string> = {
                            S: '#059669', A: '#0891b2', B: '#d97706', C: '#ea580c', D: '#dc2626',
                          };
                          return <Cell key={index} fill={colorMap[tier]} fillOpacity={0.7} stroke={colorMap[tier]} />;
                        })}
                      </Scatter>
                    </ScatterChart>
                  </ResponsiveContainer>
                  {/* Legend for scatter */}
                  <div className="mt-2 flex flex-wrap justify-center gap-4 text-[11px]">
                    {(['S', 'A', 'B', 'C', 'D'] as TierKey[]).map(t => (
                      <div key={t} className="flex items-center gap-1.5">
                        <div className={`h-2.5 w-2.5 rounded-full ${t === 'S' ? 'bg-emerald-600' : t === 'A' ? 'bg-cyan-600' : t === 'B' ? 'bg-amber-600' : t === 'C' ? 'bg-orange-600' : 'bg-red-600'}`} />
                        <span className="text-stone-600">{TIER_CONFIG[t].label}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
    </TooltipProvider>
  );
}
