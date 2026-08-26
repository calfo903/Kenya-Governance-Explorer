'use client';

import React, { useState, useMemo, useCallback } from 'react';
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from 'recharts';
import {
  Download,
  Plus,
  X,
  ArrowUpDown,
  Radar as RadarIcon,
  Table2,
  Info,
  XCircle,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Separator } from '@/components/ui/separator';
import { getCountyBudget } from '@/data/county-budget-data';
import { getCountyAuditRecords } from '@/data/county-audit-data';
import { getAllLeadership } from '@/data/county-leadership';
import { all47Governors } from '@/data/governors';

// ─── Types ──────────────────────────────────────────────────────

interface CountyScore {
  countyCode: string;
  countyName: string;
  region: string;
  budgetAbsorption: number;
  auditScore: number;
  ownRevenueRatio: number;
  devBudgetShare: number;
  pendingBillsScore: number;
  mcaCompleteness: number;
  compositeScore: number;
}

interface SortConfig {
  column: keyof CountyScore;
  direction: 'asc' | 'desc';
}

// ─── Constants ──────────────────────────────────────────────────

const RADAR_COLORS = [
  { stroke: '#10b981', fill: 'rgba(16,185,129,0.15)' },
  { stroke: '#f59e0b', fill: 'rgba(245,158,11,0.15)' },
  { stroke: '#8b5cf6', fill: 'rgba(139,92,246,0.15)' },
  { stroke: '#ef4444', fill: 'rgba(239,68,68,0.15)' },
];

const DIMENSION_LABELS: Record<string, string> = {
  budgetAbsorption: 'Budget Absorption',
  auditScore: 'Audit Score',
  ownRevenueRatio: 'Own Revenue Ratio',
  devBudgetShare: 'Dev. Budget Share',
  pendingBillsScore: 'Pending Bills (inv.)',
  mcaCompleteness: 'MCA Data Completeness',
};

const ALL_REGIONS = [
  'All Regions',
  'Coast',
  'North Eastern',
  'Eastern',
  'Central',
  'Rift Valley',
  'Western',
  'Nyanza',
  'Nairobi',
];

// ─── Score Computation ──────────────────────────────────────────

function computeAuditScore(opinion: string | null | undefined): number {
  if (!opinion) return 0;
  switch (opinion) {
    case 'Unmodified': return 100;
    case 'Qualified': return 60;
    case 'Adverse': return 30;
    case 'Disclaimer': return 0;
    default: return 0;
  }
}

function computePendingBillsScore(
  pendingBills: number,
  totalBudget: number
): number {
  if (totalBudget <= 0) return 0;
  const ratio = (pendingBills / 1000) / totalBudget;
  return Math.max(0, Math.min(100, Math.round((1 - ratio) * 100)));
}

function computeAllCountyScores(): CountyScore[] {
  const leadership = getAllLeadership();
  const governors = all47Governors;

  return leadership.map((county) => {
    const budget = getCountyBudget(county.countyCode, 'FY 2024/25');
    const auditRecords = getCountyAuditRecords(county.countyCode);
    const latestAudit = auditRecords
      .sort((a, b) => b.financialYear.localeCompare(a.financialYear))[0];

    const budgetAbsorption = budget?.devAbsorptionRate ?? 0;
    const auditScore = computeAuditScore(latestAudit?.executiveOpinion);

    const totalBudgetBn = budget?.totalBudget ?? 0;
    const ownSourceRevenueM = budget?.ownSourceRevenue ?? 0;
    const ownRevenueRatio = totalBudgetBn > 0
      ? Math.round((ownSourceRevenueM / (totalBudgetBn * 1000)) * 100)
      : 0;

    const devBudgetBn = budget?.developmentBudget ?? 0;
    const devBudgetShare = totalBudgetBn > 0
      ? Math.round((devBudgetBn / totalBudgetBn) * 100)
      : 0;

    const pendingBillsM = budget?.pendingBills ?? 0;
    const pendingBillsScore = computePendingBillsScore(pendingBillsM, totalBudgetBn);

    const totalWards = county.constituencies.reduce(
      (sum, c) => sum + c.wards.length,
      0
    );
    const verifiedMcas = county.constituencies.reduce(
      (sum, c) =>
        sum + c.wards.filter((w) => w.mca && w.mca.trim() !== '').length,
      0
    );
    const mcaCompleteness = totalWards > 0
      ? Math.round((verifiedMcas / totalWards) * 100)
      : 0;

    const normalizedComposite = Math.max(0, Math.min(100, Math.round(
      (budgetAbsorption * 0.2 +
        auditScore * 0.2 +
        Math.min(ownRevenueRatio * 2, 20) * 0.2 +
        devBudgetShare * 0.2 +
        pendingBillsScore * 0.1 +
        mcaCompleteness * 0.1)
    )));

    const govEntry = governors.find((g) => g.code === county.countyCode);

    return {
      countyCode: county.countyCode,
      countyName: county.countyName,
      region: govEntry?.region ?? county.region ?? 'Unknown',
      budgetAbsorption,
      auditScore,
      ownRevenueRatio,
      devBudgetShare,
      pendingBillsScore,
      mcaCompleteness,
      compositeScore: normalizedComposite,
    };
  });
}

// ─── Sub-components ─────────────────────────────────────────────

function ScoreCell({ value, thresholds }: { value: number; thresholds: { good: number; warn: number } }) {
  const isGood = value >= thresholds.good;
  const isWarn = value >= thresholds.warn && value < thresholds.good;

  return (
    <span
      className={`inline-flex items-center justify-center rounded-md px-2 py-0.5 text-xs font-semibold tabular-nums ${
        isGood
          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300'
          : isWarn
          ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300'
          : 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300'
      }`}
    >
      {value}
    </span>
  );
}

function AuditBadge({ score }: { score: number }) {
  if (score === 100)
    return <Badge className="bg-emerald-100 text-emerald-800 hover:bg-emerald-100 dark:bg-emerald-900/40 dark:text-emerald-300 border-0 text-xs">Unmodified</Badge>;
  if (score === 60)
    return <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-100 dark:bg-amber-900/40 dark:text-amber-300 border-0 text-xs">Qualified</Badge>;
  if (score === 30)
    return <Badge className="bg-orange-100 text-orange-800 hover:bg-orange-100 dark:bg-orange-900/40 dark:text-orange-300 border-0 text-xs">Adverse</Badge>;
  return <Badge className="bg-red-100 text-red-800 hover:bg-red-100 dark:bg-red-900/40 dark:text-red-300 border-0 text-xs">Disclaimer</Badge>;
}

// ─── Main Component ─────────────────────────────────────────────

export default function CountyComparisonEnhanced() {
  const [selectedCounties, setSelectedCounties] = useState<string[]>(['017', '020', '009']);
  const [countyToAdd, setCountyToAdd] = useState<string>('');
  const [regionFilter, setRegionFilter] = useState<string>('All Regions');
  const [sortConfig, setSortConfig] = useState<SortConfig>({
    column: 'compositeScore',
    direction: 'desc',
  });
  const [activeTab, setActiveTab] = useState<'radar' | 'matrix'>('radar');

  const allScores = useMemo(() => computeAllCountyScores(), []);

  const availableCounties = useMemo(() => {
    return allScores
      .filter((s) => !selectedCounties.includes(s.countyCode))
      .sort((a, b) => a.countyName.localeCompare(b.countyName));
  }, [allScores, selectedCounties]);

  const selectedScores = useMemo(() => {
    return selectedCounties
      .map((code) => allScores.find((s) => s.countyCode === code))
      .filter((s): s is CountyScore => !!s);
  }, [allScores, selectedCounties]);

  const radarData = useMemo(() => {
    const dimensions = Object.keys(DIMENSION_LABELS) as (keyof CountyScore)[];
    return dimensions.map((dim) => {
      const entry: Record<string, string | number> = {
        dimension: DIMENSION_LABELS[dim],
        fullMark: 100,
      };
      selectedScores.forEach((county) => {
        entry[county.countyName] = county[dim] as number;
      });
      return entry;
    });
  }, [selectedScores]);

  const filteredScores = useMemo(() => {
    let scores = [...allScores];

    if (regionFilter !== 'All Regions') {
      scores = scores.filter((s) => s.region === regionFilter);
    }

    scores.sort((a, b) => {
      const aVal = a[sortConfig.column];
      const bVal = b[sortConfig.column];
      if (typeof aVal === 'string' && typeof bVal === 'string') {
        return sortConfig.direction === 'asc'
          ? aVal.localeCompare(bVal)
          : bVal.localeCompare(aVal);
      }
      return sortConfig.direction === 'asc'
        ? (aVal as number) - (bVal as number)
        : (bVal as number) - (aVal as number);
    });

    return scores;
  }, [allScores, regionFilter, sortConfig]);

  const addCounty = useCallback(
    (code: string) => {
      if (code && selectedCounties.length < 4 && !selectedCounties.includes(code)) {
        setSelectedCounties((prev) => [...prev, code]);
        setCountyToAdd('');
      }
    },
    [selectedCounties]
  );

  const removeCounty = useCallback((code: string) => {
    setSelectedCounties((prev) => prev.filter((c) => c !== code));
  }, []);

  const handleSort = useCallback((column: keyof CountyScore) => {
    setSortConfig((prev) => ({
      column,
      direction:
        prev.column === column && prev.direction === 'asc' ? 'desc' : 'asc',
    }));
  }, []);

  const exportCSV = useCallback(() => {
    const headers = [
      'County',
      'Region',
      'Budget Absorption (%)',
      'Audit Score',
      'Own Revenue Ratio (%)',
      'Dev Budget Share (%)',
      'Pending Bills Score (inv.)',
      'MCA Completeness (%)',
      'Composite Score',
    ];

    const rows = filteredScores.map((s) => [
      s.countyName,
      s.region,
      s.budgetAbsorption,
      s.auditScore,
      s.ownRevenueRatio,
      s.devBudgetShare,
      s.pendingBillsScore,
      s.mcaCompleteness,
      s.compositeScore,
    ]);

    const csvContent = [headers, ...rows].map((row) => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'kenya_county_comparison.csv';
    link.click();
    URL.revokeObjectURL(url);
  }, [filteredScores]);

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-foreground">
            County Comparison Explorer
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Compare Kenya&apos;s 47 counties across 6 governance dimensions using FY 2024/25 data.
            Select 2–4 counties for the radar chart, or browse the full score matrix.
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          className="gap-2 shrink-0"
          onClick={exportCSV}
        >
          <Download className="h-4 w-4" />
          Download CSV
        </Button>
      </div>

      {/* Tab Switcher */}
      <div className="flex gap-1 p-1 rounded-lg bg-muted/50 w-fit">
        <button
          className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'radar'
              ? 'bg-background text-foreground shadow-sm'
              : 'text-muted-foreground hover:text-foreground'
          }`}
          onClick={() => setActiveTab('radar')}
        >
          <RadarIcon className="h-4 w-4" />
          Radar Chart
        </button>
        <button
          className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'matrix'
              ? 'bg-background text-foreground shadow-sm'
              : 'text-muted-foreground hover:text-foreground'
          }`}
          onClick={() => setActiveTab('matrix')}
        >
          <Table2 className="h-4 w-4" />
          Score Matrix
        </button>
      </div>

      {activeTab === 'radar' ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Radar Chart */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="text-lg">Governance Radar</CardTitle>
              <CardDescription>
                Side-by-side comparison of {selectedScores.length} counties across 6 key dimensions.
                All scores normalized to 0–100.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {selectedScores.length >= 2 ? (
                <ResponsiveContainer width="100%" height={420}>
                  <RadarChart cx="50%" cy="50%" outerRadius="75%" data={radarData}>
                    <PolarGrid
                      stroke="hsl(var(--border))"
                      strokeOpacity={0.5}
                    />
                    <PolarAngleAxis
                      dataKey="dimension"
                      tick={{
                        fill: 'hsl(var(--muted-foreground))',
                        fontSize: 11,
                      }}
                    />
                    <PolarRadiusAxis
                      angle={90}
                      domain={[0, 100]}
                      tick={{
                        fill: 'hsl(var(--muted-foreground))',
                        fontSize: 10,
                      }}
                    />
                    {selectedScores.map((county, i) => (
                      <Radar
                        key={county.countyCode}
                        name={county.countyName}
                        dataKey={county.countyName}
                        stroke={RADAR_COLORS[i % RADAR_COLORS.length].stroke}
                        fill={RADAR_COLORS[i % RADAR_COLORS.length].fill}
                        strokeWidth={2}
                      />
                    ))}
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'hsl(var(--popover))',
                        borderColor: 'hsl(var(--border))',
                        borderRadius: '8px',
                        fontSize: '12px',
                        color: 'hsl(var(--popover-foreground))',
                      }}
                    />
                    <Legend
                      wrapperStyle={{ fontSize: '12px', paddingTop: '16px' }}
                    />
                  </RadarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex flex-col items-center justify-center h-[420px] text-muted-foreground">
                  <RadarIcon className="h-12 w-12 mb-4 opacity-30" />
                  <p className="text-sm font-medium">Select at least 2 counties</p>
                  <p className="text-xs mt-1">Use the selector on the right to add counties</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Selection Panel */}
          <div className="space-y-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  Selected Counties
                  <Badge variant="secondary" className="ml-auto">
                    {selectedCounties.length}/4
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex flex-wrap gap-2 min-h-[40px]">
                  {selectedScores.map((county, i) => (
                    <div
                      key={county.countyCode}
                      className="flex items-center gap-1.5 rounded-full pl-1 pr-2 py-0.5 text-xs font-medium border"
                      style={{
                        borderColor: RADAR_COLORS[i % RADAR_COLORS.length].stroke,
                        backgroundColor: RADAR_COLORS[i % RADAR_COLORS.length].fill,
                        color: RADAR_COLORS[i % RADAR_COLORS.length].stroke,
                      }}
                    >
                      <div
                        className="h-2 w-2 rounded-full"
                        style={{
                          backgroundColor: RADAR_COLORS[i % RADAR_COLORS.length].stroke,
                        }}
                      />
                      {county.countyName}
                      <button
                        onClick={() => removeCounty(county.countyCode)}
                        className="ml-0.5 hover:opacity-70 transition-opacity"
                        aria-label={`Remove ${county.countyName}`}
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>

                <Separator />

                {selectedCounties.length < 4 && (
                  <div className="space-y-2">
                    <label className="text-xs font-medium text-muted-foreground">
                      Add a county to compare
                    </label>
                    <div className="flex gap-2">
                      <Select
                        value={countyToAdd}
                        onValueChange={(val) => setCountyToAdd(val)}
                      >
                        <SelectTrigger className="flex-1">
                          <SelectValue placeholder="Choose a county..." />
                        </SelectTrigger>
                        <SelectContent className="max-h-60">
                          {availableCounties.map((c) => (
                            <SelectItem key={c.countyCode} value={c.countyCode}>
                              <span className="flex items-center gap-2">
                                <span className="text-muted-foreground text-xs">{c.region}</span>
                                {c.countyName}
                              </span>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={!countyToAdd}
                        onClick={() => addCounty(countyToAdd)}
                        className="shrink-0"
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}

                {selectedCounties.length >= 4 && (
                  <p className="text-xs text-muted-foreground text-center py-2">
                    Maximum 4 counties. Remove one to add another.
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Methodology card */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Info className="h-4 w-4" />
                  Methodology
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-xs text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <span className="font-medium text-foreground shrink-0 w-24">Absorption</span>
                    Dev. budget absorption rate %
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="font-medium text-foreground shrink-0 w-24">Audit</span>
                    Unmodified=100, Qualified=60, Adverse=30, Disclaimer=0
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="font-medium text-foreground shrink-0 w-24">Own Revenue</span>
                    Own-source revenue / total budget * 100
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="font-medium text-foreground shrink-0 w-24">Dev. Share</span>
                    Development budget / total budget * 100
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="font-medium text-foreground shrink-0 w-24">Pend. Bills</span>
                    Inverse: lower pending bills ratio = higher score
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="font-medium text-foreground shrink-0 w-24">MCA Data</span>
                    % of ward MCAs with verified names
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      ) : (
        /* Score Matrix Tab */
        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <CardTitle className="text-lg">Full Score Matrix</CardTitle>
                <CardDescription>
                  All {filteredScores.length} counties scored across 6 governance dimensions.
                  Click column headers to sort. Click + to add to radar comparison.
                </CardDescription>
              </div>
              <Select value={regionFilter} onValueChange={setRegionFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by region" />
                </SelectTrigger>
                <SelectContent>
                  {ALL_REGIONS.map((region) => (
                    <SelectItem key={region} value={region}>
                      {region}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent>
            <div className="max-h-[600px] overflow-y-auto rounded-md border">
              <Table>
                <TableHeader sticky>
                  <TableRow>
                    <TableHead className="w-[40px]" />
                    <TableHead
                      className="cursor-pointer select-none min-w-[140px]"
                      onClick={() => handleSort('countyName')}
                    >
                      County
                      {sortConfig.column === 'countyName' && (
                        <ArrowUpDown className="ml-1 h-3 w-3 inline-block opacity-50" />
                      )}
                    </TableHead>
                    <TableHead className="hidden md:table-cell min-w-[100px]">Region</TableHead>
                    <TableHead
                      className="cursor-pointer select-none text-center min-w-[100px]"
                      onClick={() => handleSort('budgetAbsorption')}
                    >
                      Budget Abs.
                      {sortConfig.column === 'budgetAbsorption' && (
                        <ArrowUpDown className="ml-1 h-3 w-3 inline-block opacity-50" />
                      )}
                    </TableHead>
                    <TableHead
                      className="cursor-pointer select-none text-center min-w-[100px]"
                      onClick={() => handleSort('auditScore')}
                    >
                      Audit
                      {sortConfig.column === 'auditScore' && (
                        <ArrowUpDown className="ml-1 h-3 w-3 inline-block opacity-50" />
                      )}
                    </TableHead>
                    <TableHead
                      className="cursor-pointer select-none text-center min-w-[100px] hidden sm:table-cell"
                      onClick={() => handleSort('ownRevenueRatio')}
                    >
                      Own Rev.
                      {sortConfig.column === 'ownRevenueRatio' && (
                        <ArrowUpDown className="ml-1 h-3 w-3 inline-block opacity-50" />
                      )}
                    </TableHead>
                    <TableHead
                      className="cursor-pointer select-none text-center min-w-[90px] hidden lg:table-cell"
                      onClick={() => handleSort('devBudgetShare')}
                    >
                      Dev Share
                      {sortConfig.column === 'devBudgetShare' && (
                        <ArrowUpDown className="ml-1 h-3 w-3 inline-block opacity-50" />
                      )}
                    </TableHead>
                    <TableHead
                      className="cursor-pointer select-none text-center min-w-[90px] hidden lg:table-cell"
                      onClick={() => handleSort('pendingBillsScore')}
                    >
                      Pend. Bills
                      {sortConfig.column === 'pendingBillsScore' && (
                        <ArrowUpDown className="ml-1 h-3 w-3 inline-block opacity-50" />
                      )}
                    </TableHead>
                    <TableHead
                      className="cursor-pointer select-none text-center min-w-[90px] hidden md:table-cell"
                      onClick={() => handleSort('mcaCompleteness')}
                    >
                      MCA
                      {sortConfig.column === 'mcaCompleteness' && (
                        <ArrowUpDown className="ml-1 h-3 w-3 inline-block opacity-50" />
                      )}
                    </TableHead>
                    <TableHead
                      className="cursor-pointer select-none text-center min-w-[100px]"
                      onClick={() => handleSort('compositeScore')}
                    >
                      <span className="font-bold">Score</span>
                      {sortConfig.column === 'compositeScore' && (
                        <ArrowUpDown className="ml-1 h-3 w-3 inline-block opacity-50" />
                      )}
                    </TableHead>
                  </TableRow>
 </TableHeader>
                <TableBody>
                  {filteredScores.map((county) => {
                    const isSelected = selectedCounties.includes(county.countyCode);
                    return (
                      <TableRow
                        key={county.countyCode}
                        className={isSelected ? 'bg-emerald-50/50 dark:bg-emerald-950/20' : ''}
                      >
                        <TableCell className="pr-0">
                          <Button
                            variant="ghost"
                            size="icon"
                            className={`h-6 w-6 ${isSelected ? 'text-emerald-600 dark:text-emerald-400' : 'text-muted-foreground hover:text-foreground'}`}
                            onClick={() =>
                              isSelected
                                ? removeCounty(county.countyCode)
                                : selectedCounties.length < 4
                                ? addCounty(county.countyCode)
                                : undefined
                            }
                            disabled={!isSelected && selectedCounties.length >= 4}
                            title={
                              isSelected
                                ? 'Remove from comparison'
                                : selectedCounties.length >= 4
                                ? 'Max 4 counties'
                                : 'Add to comparison'
                            }
                          >
                            {isSelected ? (
                              <XCircle className="h-3.5 w-3.5" />
                            ) : (
                              <Plus className="h-3.5 w-3.5" />
                            )}
                          </Button>
                        </TableCell>
                        <TableCell className="font-medium text-sm">
                          {county.countyName}
                        </TableCell>
                        <TableCell className="hidden md:table-cell text-xs text-muted-foreground">
                          {county.region}
                        </TableCell>
                        <TableCell className="text-center">
                          <ScoreCell value={county.budgetAbsorption} thresholds={{ good: 50, warn: 30 }} />
                        </TableCell>
                        <TableCell className="text-center">
                          <AuditBadge score={county.auditScore} />
                        </TableCell>
                        <TableCell className="text-center hidden sm:table-cell">
                          <ScoreCell value={county.ownRevenueRatio} thresholds={{ good: 15, warn: 5 }} />
                        </TableCell>
                        <TableCell className="text-center hidden lg:table-cell">
                          <ScoreCell value={county.devBudgetShare} thresholds={{ good: 40, warn: 30 }} />
                        </TableCell>
                        <TableCell className="text-center hidden lg:table-cell">
                          <ScoreCell value={county.pendingBillsScore} thresholds={{ good: 60, warn: 30 }} />
                        </TableCell>
                        <TableCell className="text-center hidden md:table-cell">
                          <ScoreCell value={county.mcaCompleteness} thresholds={{ good: 90, warn: 70 }} />
                        </TableCell>
                        <TableCell className="text-center">
                          <span className="inline-flex items-center justify-center rounded-md px-2.5 py-1 text-sm font-bold tabular-nums bg-emerald-600 text-white dark:bg-emerald-500">
                            {county.compositeScore}
                          </span>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>

            <div className="flex flex-wrap gap-4 mt-4 text-xs text-muted-foreground">
              <span>
                Showing <strong>{filteredScores.length}</strong> of 47 counties
              </span>
              <span>
                Top scorer:{' '}
                <strong className="text-foreground">
                  {filteredScores[0]?.countyName} ({filteredScores[0]?.compositeScore})
                </strong>
              </span>
              <span className="flex items-center gap-1">
                <span className="inline-block w-2 h-2 rounded-full bg-emerald-500" />
                Good
              </span>
              <span className="flex items-center gap-1">
                <span className="inline-block w-2 h-2 rounded-full bg-amber-500" />
                Warning
              </span>
              <span className="flex items-center gap-1">
                <span className="inline-block w-2 h-2 rounded-full bg-red-500" />
                Critical
              </span>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
