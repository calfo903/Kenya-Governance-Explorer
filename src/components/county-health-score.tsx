'use client';

import React, { useState, useMemo } from 'react';
import {
  Activity, TrendingUp, TrendingDown, ArrowUpDown, BarChart3,
  Radar as RadarIcon, GitCompare, ChevronDown, ChevronUp,
  Info, Award, AlertTriangle, CheckCircle2, Minus,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  Radar, ResponsiveContainer, Tooltip,
  LineChart, Line, XAxis, YAxis, CartesianGrid, Legend,
} from 'recharts';

// --- Types ---

interface CountyScore {
  county: string;
  code: string;
  region: string;
  auditOpinion: number;
  budgetAbsorption: number;
  projectDelivery: number;
  citizenSatisfaction: number;
  transparencyIndex: number;
  fy2223: number;
  fy2324: number;
  fy2425: number;
}

// --- Mock Data ---
// 15 counties with 5 weighted dimensions, each 0-100

const COUNTY_DATA: CountyScore[] = [
  { county: 'Makueni', code: '016', region: 'Eastern', auditOpinion: 88, budgetAbsorption: 82, projectDelivery: 85, citizenSatisfaction: 78, transparencyIndex: 90, fy2223: 68, fy2324: 78, fy2425: 85 },
  { county: 'Laikipia', code: '022', region: 'Rift Valley', auditOpinion: 85, budgetAbsorption: 75, projectDelivery: 80, citizenSatisfaction: 72, transparencyIndex: 82, fy2223: 62, fy2324: 72, fy2425: 79 },
  { county: 'Nyeri', code: '019', region: 'Central', auditOpinion: 82, budgetAbsorption: 78, projectDelivery: 76, citizenSatisfaction: 70, transparencyIndex: 80, fy2223: 64, fy2324: 70, fy2425: 77 },
  { county: 'Uasin Gishu', code: '039', region: 'Rift Valley', auditOpinion: 75, budgetAbsorption: 72, projectDelivery: 70, citizenSatisfaction: 65, transparencyIndex: 68, fy2223: 58, fy2324: 65, fy2425: 70 },
  { county: 'Nakuru', code: '032', region: 'Rift Valley', auditOpinion: 72, budgetAbsorption: 60, projectDelivery: 65, citizenSatisfaction: 62, transparencyIndex: 70, fy2223: 55, fy2324: 60, fy2425: 66 },
  { county: 'Mombasa', code: '001', region: 'Coast', auditOpinion: 70, budgetAbsorption: 55, projectDelivery: 62, citizenSatisfaction: 60, transparencyIndex: 65, fy2223: 50, fy2324: 58, fy2425: 62 },
  { county: 'Kisumu', code: '041', region: 'Nyanza', auditOpinion: 68, budgetAbsorption: 58, projectDelivery: 55, citizenSatisfaction: 62, transparencyIndex: 60, fy2223: 48, fy2324: 55, fy2425: 61 },
  { county: 'Kiambu', code: '022', region: 'Central', auditOpinion: 72, budgetAbsorption: 65, projectDelivery: 58, citizenSatisfaction: 55, transparencyIndex: 62, fy2223: 52, fy2324: 58, fy2425: 62 },
  { county: 'Kilifi', code: '003', region: 'Coast', auditOpinion: 55, budgetAbsorption: 45, projectDelivery: 50, citizenSatisfaction: 48, transparencyIndex: 52, fy2223: 38, fy2324: 44, fy2425: 50 },
  { county: 'Turkana', code: '040', region: 'Rift Valley', auditOpinion: 60, budgetAbsorption: 75, projectDelivery: 68, citizenSatisfaction: 55, transparencyIndex: 58, fy2223: 45, fy2324: 55, fy2425: 63 },
  { county: 'Kakamega', code: '045', region: 'Western', auditOpinion: 42, budgetAbsorption: 48, projectDelivery: 40, citizenSatisfaction: 38, transparencyIndex: 35, fy2223: 30, fy2324: 36, fy2425: 41 },
  { county: 'Nairobi City', code: '047', region: 'Nairobi', auditOpinion: 45, budgetAbsorption: 52, projectDelivery: 48, citizenSatisfaction: 55, transparencyIndex: 60, fy2223: 42, fy2324: 48, fy2425: 52 },
  { county: 'Mandera', code: '009', region: 'North Eastern', auditOpinion: 58, budgetAbsorption: 78, projectDelivery: 65, citizenSatisfaction: 42, transparencyIndex: 48, fy2223: 40, fy2324: 50, fy2425: 58 },
  { county: 'Machakos', code: '017', region: 'Eastern', auditOpinion: 52, budgetAbsorption: 42, projectDelivery: 45, citizenSatisfaction: 50, transparencyIndex: 48, fy2223: 35, fy2324: 40, fy2425: 47 },
  { county: 'Homa Bay', code: '046', region: 'Nyanza', auditOpinion: 48, budgetAbsorption: 40, projectDelivery: 38, citizenSatisfaction: 42, transparencyIndex: 40, fy2223: 32, fy2324: 38, fy2425: 42 },
];

// Weights for overall score
const WEIGHTS = {
  auditOpinion: 0.25,
  budgetAbsorption: 0.25,
  projectDelivery: 0.20,
  citizenSatisfaction: 0.15,
  transparencyIndex: 0.15,
};

const DIMENSIONS = [
  { key: 'auditOpinion' as const, label: 'Audit Opinion', weight: '25%' },
  { key: 'budgetAbsorption' as const, label: 'Budget Absorption', weight: '25%' },
  { key: 'projectDelivery' as const, label: 'Project Delivery', weight: '20%' },
  { key: 'citizenSatisfaction' as const, label: 'Citizen Satisfaction', weight: '15%' },
  { key: 'transparencyIndex' as const, label: 'Transparency Index', weight: '15%' },
];

const RADAR_COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6'];

// --- Helpers ---

function computeOverall(c: CountyScore): number {
  return Math.round(
    c.auditOpinion * WEIGHTS.auditOpinion +
    c.budgetAbsorption * WEIGHTS.budgetAbsorption +
    c.projectDelivery * WEIGHTS.projectDelivery +
    c.citizenSatisfaction * WEIGHTS.citizenSatisfaction +
    c.transparencyIndex * WEIGHTS.transparencyIndex
  );
}

function scoreBadge(score: number): { label: string; className: string } {
  if (score >= 80) return { label: 'Excellent', className: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400' };
  if (score >= 60) return { label: 'Good', className: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400' };
  if (score >= 40) return { label: 'Fair', className: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400' };
  return { label: 'Poor', className: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400' };
}

function scoreTextColor(score: number): string {
  if (score >= 80) return 'text-emerald-600 dark:text-emerald-400';
  if (score >= 60) return 'text-blue-600 dark:text-blue-400';
  if (score >= 40) return 'text-amber-600 dark:text-amber-400';
  return 'text-red-600 dark:text-red-400';
}

function dimColor(value: number): string {
  if (value >= 70) return 'text-emerald-600 dark:text-emerald-400';
  if (value >= 50) return 'text-amber-600 dark:text-amber-400';
  return 'text-red-600 dark:text-red-400';
}

function trendIcon(current: number, previous: number) {
  const diff = current - previous;
  if (diff > 3) return <TrendingUp className="w-3.5 h-3.5 text-emerald-500" />;
  if (diff < -3) return <TrendingDown className="w-3.5 h-3.5 text-red-500" />;
  return <Minus className="w-3.5 h-3.5 text-stone-400" />;
}

// --- Component ---

export default function CountyHealthScore() {
  const [selectedCounty, setSelectedCounty] = useState('Makueni');
  const [compareCounties, setCompareCounties] = useState<string[]>(['Makueni', 'Laikipia']);
  const [sortField, setSortField] = useState<'overall' | 'county'>('overall');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');
  const [drilldownCounty, setDrilldownCounty] = useState<string | null>(null);

  const countyMap = useMemo(() => {
    const m = new Map<string, CountyScore>();
    COUNTY_DATA.forEach((c) => m.set(c.county, c));
    return m;
  }, []);

  const ranked = useMemo(() => {
    return COUNTY_DATA.map((c) => ({
      ...c,
      overall: computeOverall(c),
    })).sort((a, b) => {
      const mult = sortDir === 'asc' ? 1 : -1;
      if (sortField === 'overall') return (a.overall - b.overall) * mult;
      return a.county.localeCompare(b.county) * mult;
    });
  }, [sortField, sortDir]);

  const selected = countyMap.get(selectedCounty);
  const drilldown = drilldownCounty ? countyMap.get(drilldownCounty) : null;

  const radarData = useMemo(() => {
    return DIMENSIONS.map((d) => {
      const entry: Record<string, string | number> = { dimension: d.label };
      compareCounties.forEach((county, i) => {
        const c = countyMap.get(county);
        if (c) {
          entry[county] = c[d.key];
        }
      });
      return entry;
    });
  }, [compareCounties, countyMap]);

  const trendData = useMemo(() => {
    if (!selected) return [];
    return [
      { year: 'FY 2022/23', score: selected.fy2223 },
      { year: 'FY 2023/24', score: selected.fy2324 },
      { year: 'FY 2024/25', score: selected.fy2425 },
    ];
  }, [selected]);

  const handleCompareToggle = (county: string) => {
    setCompareCounties((prev) => {
      if (prev.includes(county)) {
        return prev.filter((c) => c !== county);
      }
      if (prev.length >= 4) {
        return prev;
      }
      return [...prev, county];
    });
  };

  const handleSort = (field: 'overall' | 'county') => {
    if (sortField === field) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDir(field === 'overall' ? 'desc' : 'asc');
    }
  };

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="p-6 space-y-6">
        {/* Header */}
        <div>
          <div className="flex items-center gap-3 mb-1">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-900/40">
              <Activity className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            </div>
            <h1 className="text-xl font-semibold text-stone-900 dark:text-stone-50">
              County Health Score
            </h1>
          </div>
          <p className="text-sm text-stone-500 dark:text-stone-400 ml-13">
            Composite governance health index combining audit, budget, delivery, satisfaction, and transparency metrics
          </p>
        </div>

        {/* Legend / Weighting Info */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 mb-3">
              <Info className="w-4 h-4 text-stone-500" />
              <span className="text-xs font-medium text-stone-700 dark:text-stone-300">Score Composition</span>
            </div>
            <div className="flex flex-wrap gap-3">
              {DIMENSIONS.map((d) => (
                <div key={d.key} className="flex items-center gap-1.5">
                  <Badge variant="outline" className="text-[10px]">{d.label}</Badge>
                  <span className="text-[10px] text-stone-500 dark:text-stone-400">({d.weight})</span>
                </div>
              ))}
            </div>
            <div className="flex flex-wrap gap-2 mt-3">
              <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400 text-[10px]">Excellent (80+)</Badge>
              <Badge className="bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400 text-[10px]">Good (60-79)</Badge>
              <Badge className="bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400 text-[10px]">Fair (40-59)</Badge>
              <Badge className="bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400 text-[10px]">Poor (&lt;40)</Badge>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Radar Chart */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <RadarIcon className="w-4 h-4 text-emerald-500" />
                Radar Profile
              </CardTitle>
              <CardDescription>Compare up to 4 counties across all dimensions</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap gap-2">
                {compareCounties.map((county, i) => (
                  <Badge
                    key={county}
                    className="cursor-pointer gap-1"
                    style={{
                      backgroundColor: `${RADAR_COLORS[i]}20`,
                      color: RADAR_COLORS[i],
                      borderColor: RADAR_COLORS[i],
                    }}
                    onClick={() => handleCompareToggle(county)}
                  >
                    {county} (x)
                  </Badge>
                ))}
                {compareCounties.length < 4 && (
                  <Select
                    onValueChange={(v) => handleCompareToggle(v)}
                  >
                    <SelectTrigger className="w-40 h-7 text-xs">
                      <SelectValue placeholder="+ Add county" />
                    </SelectTrigger>
                    <SelectContent>
                      {COUNTY_DATA
                        .filter((c) => !compareCounties.includes(c.county))
                        .map((c) => (
                          <SelectItem key={c.county} value={c.county}>{c.county}</SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                )}
              </div>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart data={radarData}>
                    <PolarGrid stroke="hsl(var(--border))" />
                    <PolarAngleAxis
                      dataKey="dimension"
                      tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
                    />                    <PolarRadiusAxis
                      angle={90}
                      domain={[0, 100]}
                      tick={{ fontSize: 9, fill: 'hsl(var(--muted-foreground))' }}
                    />                    {compareCounties.map((county, i) => (
                      <Radar
                        key={county}
                        name={county}
                        dataKey={county}
                        stroke={RADAR_COLORS[i]}
                        fill={RADAR_COLORS[i]}
                        fillOpacity={0.15}
                        strokeWidth={2}
                      />
                    ))}
                    <Tooltip
                      contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 8, fontSize: 12 }}
                    />
                    <Legend wrapperStyle={{ fontSize: 11 }} />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Trend Line for Selected County */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-emerald-500" />
                Score Trend
              </CardTitle>
              <CardDescription>3-year overall score trajectory for selected county</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Select
                value={selectedCounty}
                onValueChange={(v) => { setSelectedCounty(v); setDrilldownCounty(null); }}
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {COUNTY_DATA.map((c) => (
                    <SelectItem key={c.county} value={c.county}>{c.county} ({c.region})</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {selected && (
                <>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-stone-900 dark:text-stone-50">{selected.county}</p>
                      <p className="text-xs text-stone-500 dark:text-stone-400">{selected.region}</p>
                    </div>
                    <div className="text-right">
                      <p className={`text-2xl font-bold ${scoreTextColor(computeOverall(selected))}`}>{computeOverall(selected)}</p>
                      <Badge className={`text-[10px] ${scoreBadge(computeOverall(selected)).className}`}>
                        {scoreBadge(computeOverall(selected)).label}
                      </Badge>
                    </div>
                  </div>
                  <div className="h-48">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={trendData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                        <XAxis dataKey="year" tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} />
                        <YAxis domain={[0, 100]} tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} />
                        <Tooltip
                          contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 8, fontSize: 12 }}
                          formatter={(value: number) => [value, 'Overall Score']}
                        />
                        <Line
                          type="monotone"
                          dataKey="score"
                          stroke="#10b981"
                          strokeWidth={2.5}
                          dot={{ r: 5, fill: '#10b981' }}
                          activeDot={{ r: 7 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div className="p-2 rounded-lg bg-stone-100 dark:bg-stone-800">
                      <p className="text-[10px] text-stone-500 dark:text-stone-400">FY 22/23</p>
                      <p className="text-sm font-bold text-stone-900 dark:text-stone-50">{selected.fy2223}</p>
                    </div>
                    <div className="p-2 rounded-lg bg-stone-100 dark:bg-stone-800">
                      <p className="text-[10px] text-stone-500 dark:text-stone-400">FY 23/24</p>
                      <p className="text-sm font-bold text-stone-900 dark:text-stone-50">{selected.fy2324}</p>
                    </div>
                    <div className="p-2 rounded-lg bg-stone-100 dark:bg-stone-800">
                      <p className="text-[10px] text-stone-500 dark:text-stone-400">FY 24/25</p>
                      <p className="text-sm font-bold text-stone-900 dark:text-stone-50">{selected.fy2425}</p>
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Score Drilldown */}
        {drilldown && (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Award className="w-4 h-4 text-emerald-500" />
                    {drilldown.county} -- Score Breakdown
                  </CardTitle>
                  <CardDescription>{drilldown.region} | Overall: {computeOverall(drilldown)} ({scoreBadge(computeOverall(drilldown)).label})</CardDescription>
                </div>
                <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={() => setDrilldownCounty(null)}>
                  Close
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-5 gap-4">
                {DIMENSIONS.map((d) => {
                  const value = drilldown[d.key];
                  return (
                    <div key={d.key} className="text-center p-4 rounded-xl border border-stone-200 dark:border-stone-700">
                      <p className="text-[10px] uppercase text-stone-500 dark:text-stone-400 tracking-wider mb-1">{d.label}</p>
                      <p className={`text-3xl font-bold ${dimColor(value)}`}>{value}</p>
                      <p className="text-[10px] text-stone-500 dark:text-stone-400 mt-1">Weight: {d.weight}</p>
                      <div className="h-1.5 bg-stone-200 dark:bg-stone-700 rounded-full mt-2 overflow-hidden">
                        <div
                          className={`h-full rounded-full ${value >= 70 ? 'bg-emerald-500' : value >= 50 ? 'bg-amber-500' : 'bg-red-500'}`}
                          style={{ width: `${value}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Ranking Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-emerald-500" />
              County Ranking Table
            </CardTitle>
            <CardDescription>All 15 tracked counties sorted by composite health score</CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[480px]">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-stone-200 dark:border-stone-700">
                    <th className="text-left text-[10px] uppercase text-stone-500 dark:text-stone-400 tracking-wider py-2 w-8">#</th>
                    <th
                      className="text-left text-[10px] uppercase text-stone-500 dark:text-stone-400 tracking-wider py-2 cursor-pointer select-none"
                      onClick={() => handleSort('county')}
                    >
                      <span className="flex items-center gap-1">County {sortField === 'county' && (sortDir === 'asc' ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />)}</span>
                    </th>
                    <th className="text-left text-[10px] uppercase text-stone-500 dark:text-stone-400 tracking-wider py-2">Region</th>
                    <th
                      className="text-right text-[10px] uppercase text-stone-500 dark:text-stone-400 tracking-wider py-2 cursor-pointer select-none"
                      onClick={() => handleSort('overall')}
                    >
                      <span className="flex items-center gap-1 justify-end">Overall {sortField === 'overall' && (sortDir === 'asc' ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />)}</span>
                    </th>
                    <th className="text-right text-[10px] uppercase text-stone-500 dark:text-stone-400 tracking-wider py-2">Audit</th>
                    <th className="text-right text-[10px] uppercase text-stone-500 dark:text-stone-400 tracking-wider py-2">Budget</th>
                    <th className="text-right text-[10px] uppercase text-stone-500 dark:text-stone-400 tracking-wider py-2">Projects</th>
                    <th className="text-right text-[10px] uppercase text-stone-500 dark:text-stone-400 tracking-wider py-2">Satisf.</th>
                    <th className="text-right text-[10px] uppercase text-stone-500 dark:text-stone-400 tracking-wider py-2">Transp.</th>
                    <th className="text-center text-[10px] uppercase text-stone-500 dark:text-stone-400 tracking-wider py-2">Trend</th>
                    <th className="text-center text-[10px] uppercase text-stone-500 dark:text-stone-400 tracking-wider py-2 w-20">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {ranked.map((c, i) => {
                    const badge = scoreBadge(c.overall);
                    return (
                      <tr key={c.county} className="border-b border-stone-100 dark:border-stone-800 hover:bg-stone-50 dark:hover:bg-stone-800/50">
                        <td className={`py-2.5 text-xs font-medium ${i === 0 ? 'text-amber-500' : i < 3 ? 'text-emerald-600 dark:text-emerald-400' : 'text-stone-400'}`}>{i + 1}</td>
                        <td className="py-2.5 text-sm font-medium text-stone-900 dark:text-stone-50">{c.county}</td>
                        <td className="py-2.5 text-xs text-stone-500 dark:text-stone-400">{c.region}</td>
                        <td className="py-2.5 text-right">
                          <span className={`text-sm font-bold ${scoreTextColor(c.overall)}`}>{c.overall}</span>
                        </td>
                        <td className={`py-2.5 text-xs text-right ${dimColor(c.auditOpinion)}`}>{c.auditOpinion}</td>
                        <td className={`py-2.5 text-xs text-right ${dimColor(c.budgetAbsorption)}`}>{c.budgetAbsorption}</td>
                        <td className={`py-2.5 text-xs text-right ${dimColor(c.projectDelivery)}`}>{c.projectDelivery}</td>
                        <td className={`py-2.5 text-xs text-right ${dimColor(c.citizenSatisfaction)}`}>{c.citizenSatisfaction}</td>
                        <td className={`py-2.5 text-xs text-right ${dimColor(c.transparencyIndex)}`}>{c.transparencyIndex}</td>
                        <td className="py-2.5 text-center">{trendIcon(c.fy2425, c.fy2324)}</td>
                        <td className="py-2.5 text-center">
                          <div className="flex items-center justify-center gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-6 text-[10px] px-2"
                              onClick={() => setDrilldownCounty(c.county)}
                            >
                              Detail
                            </Button>
                            <Button
                              variant={compareCounties.includes(c.county) ? 'secondary' : 'ghost'}
                              size="sm"
                              className="h-6 text-[10px] px-2"
                              onClick={() => handleCompareToggle(c.county)}
                            >
                              Compare
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
